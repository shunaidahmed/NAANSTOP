/**
 * NAAN STOP - CMS API.  One serverless function, every route.
 *
 *   GET  /api/cms            -> published content (public, CDN-cached 60s)
 *   GET  /api/cms?draft=1    -> draft content (requires sign-in)
 *   POST /api/cms            -> { action, ... } admin actions
 *
 * Storage is Vercel Blob: Vercel's filesystem is read-only, so JSON documents
 * and uploaded images both live there.
 */
import { put, list, del } from "@vercel/blob";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const config = { runtime: "nodejs", maxDuration: 20 };

/* -- paths ----------------------------------------------------------- */
const LIVE = "cms/live.json";
const DRAFT = "cms/draft.json";
const SNAP = "cms/snap/";
const UPLOADS = "cms/uploads/";
const SNAP_KEEP = 20;

const SECRET = process.env.CMS_SECRET || "";
const SEED_PASSWORD = process.env.ADMIN_PASSWORD || "";

/** Blob has no private buckets, so the credential file lives at a path nobody
 *  can guess without CMS_SECRET - and holds a scrypt hash, never a password.
 *  ponytail: capability-URL + hash. Move to Postgres if you ever need >1 user. */
const authPath = () => `cms/.auth-${sig("auth-file")}.json`;

/* -- helpers --------------------------------------------------------- */
function sig(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

/** Public blob URLs are `https://<storeId>.public.blob.vercel-storage.com/<path>`
 *  and the store id is the 4th segment of the read-write token. Deriving it
 *  saves a `list()` round trip on every read. */
function blobBase(): string {
  const id = (process.env.BLOB_READ_WRITE_TOKEN || "").split("_")[3];
  return `https://${id}.public.blob.vercel-storage.com`;
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${blobBase()}/${path}?v=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await put(path, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

/* -- password -------------------------------------------------------- */
type Auth = { salt: string; hash: string; seeded: boolean };

function hashPw(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function makeAuth(password: string, seeded: boolean): Auth {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: hashPw(password, salt), seeded };
}

async function getAuth(): Promise<Auth | null> {
  const stored = await readJson<Auth | null>(authPath(), null);
  if (stored) return stored;
  if (!SEED_PASSWORD) return null;
  const fresh = makeAuth(SEED_PASSWORD, true);
  await writeJson(authPath(), fresh);
  return fresh;
}

function pwMatches(auth: Auth, password: string): boolean {
  const a = Buffer.from(hashPw(password, auth.salt), "hex");
  const b = Buffer.from(auth.hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/* -- session --------------------------------------------------------- */
const COOKIE = "ns_cms";
const TTL = 1000 * 60 * 60 * 12;

function mintCookie(): string {
  const exp = Date.now() + TTL;
  return `${COOKIE}=${exp}.${sig(String(exp))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL / 1000}`;
}

const killCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function signedIn(req: Request): boolean {
  if (!SECRET) return false;
  const raw = req.headers.get("cookie") || "";
  const token = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1];
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sig(exp));
  const got = Buffer.from(mac);
  return want.length === got.length && timingSafeEqual(want, got);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* -- handler --------------------------------------------------------- */
export default async function handler(req: Request): Promise<Response> {
  if (!SECRET) return json({ error: "CMS_SECRET is not set on this deployment." }, 500);

  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.has("draft")) {
      if (!signedIn(req)) return json({ error: "Not signed in" }, 401);
      const draft = await readJson<unknown>(DRAFT, null);
      return json(draft ?? (await readJson<unknown>(LIVE, {})), 200, { "cache-control": "no-store" });
    }
    const live = await readJson<unknown>(LIVE, {});
    return json(live, 200, {
      "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
    });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad JSON body" }, 400);
  }
  const action = String(body.action || "");

  /* --- unauthenticated --- */
  if (action === "login") {
    const auth = await getAuth();
    if (!auth) return json({ error: "No password configured. Set ADMIN_PASSWORD." }, 500);
    if (!pwMatches(auth, String(body.password || ""))) {
      // ponytail: fixed delay, not a counter. Add Upstash rate limiting if the URL ever leaks.
      await sleep(600);
      return json({ error: "Wrong password" }, 401);
    }
    return json({ ok: true, mustChangePassword: auth.seeded }, 200, { "set-cookie": mintCookie() });
  }

  if (action === "me") {
    if (!signedIn(req)) return json({ signedIn: false });
    const auth = await getAuth();
    return json({ signedIn: true, mustChangePassword: !!auth?.seeded });
  }

  if (action === "logout") return json({ ok: true }, 200, { "set-cookie": killCookie() });

  /* --- everything below needs a session --- */
  if (!signedIn(req)) return json({ error: "Not signed in" }, 401);

  switch (action) {
    case "save": {
      if (!body.content || typeof body.content !== "object") return json({ error: "No content" }, 400);
      const draft = { ...body.content, updatedAt: new Date().toISOString() };
      await writeJson(DRAFT, draft);
      return json({ ok: true, updatedAt: draft.updatedAt });
    }

    case "publish": {
      const draft = await readJson<any>(DRAFT, null);
      if (!draft) return json({ error: "Nothing to publish" }, 400);

      const previous = await readJson<any>(LIVE, null);
      if (previous) {
        await writeJson(`${SNAP}${new Date().toISOString().replace(/[:.]/g, "-")}.json`, previous);
      }

      const publishedAt = new Date().toISOString();
      await writeJson(LIVE, { ...draft, publishedAt });

      const { blobs } = await list({ prefix: SNAP, limit: 1000 });
      const stale = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname)).slice(SNAP_KEEP);
      if (stale.length) await del(stale.map((b) => b.url));

      return json({ ok: true, publishedAt });
    }

    case "history": {
      const { blobs } = await list({ prefix: SNAP, limit: 1000 });
      return json({
        snapshots: blobs
          .map((b) => ({ id: b.pathname.slice(SNAP.length).replace(/\.json$/, ""), size: b.size }))
          .sort((a, b) => b.id.localeCompare(a.id)),
      });
    }

    case "restore": {
      const id = String(body.id || "").replace(/[^0-9A-Za-z.\-]/g, "");
      if (!id) return json({ error: "No snapshot id" }, 400);
      const snap = await readJson<any>(`${SNAP}${id}.json`, null);
      if (!snap) return json({ error: "Snapshot not found" }, 404);
      await writeJson(DRAFT, { ...snap, updatedAt: new Date().toISOString() });
      return json({ ok: true });
    }

    case "password": {
      const auth = await getAuth();
      if (!auth) return json({ error: "No password configured" }, 500);
      if (!pwMatches(auth, String(body.current || ""))) {
        return json({ error: "Current password is wrong" }, 401);
      }
      const next = String(body.next || "");
      if (next.length < 10) return json({ error: "Use at least 10 characters" }, 400);
      await writeJson(authPath(), makeAuth(next, false));
      return json({ ok: true });
    }

    case "upload": {
      // The panel downscales images in the browser before sending, which keeps
      // the payload well inside Vercel's 4.5 MB request body limit.
      const data = String(body.data || "");
      const match = data.match(/^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,(.+)$/);
      if (!match) return json({ error: "Send a base64 image data URL" }, 400);
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length > 4_000_000) return json({ error: "Image is too large - keep it under 4 MB" }, 413);

      const ext = match[1].split("/")[1].replace("svg+xml", "svg").replace("jpeg", "jpg");
      const name =
        String(body.name || "image")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || "image";
      const blob = await put(`${UPLOADS}${name}-${Date.now()}.${ext}`, bytes, {
        access: "public",
        contentType: match[1],
      });
      return json({ ok: true, url: blob.url });
    }

    case "media": {
      const { blobs } = await list({ prefix: UPLOADS, limit: 1000 });
      return json({
        files: blobs
          .map((b) => ({
            url: b.url,
            name: b.pathname.slice(UPLOADS.length),
            size: b.size,
            uploadedAt: b.uploadedAt,
          }))
          .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt))),
      });
    }

    case "deleteMedia": {
      const target = String(body.url || "");
      if (!target.startsWith(blobBase())) return json({ error: "Not a media file" }, 400);
      await del(target);
      return json({ ok: true });
    }

    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }
}

export { mintCookie, signedIn };
