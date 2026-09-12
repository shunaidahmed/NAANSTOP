/**
 * Writes public/admin/defaults.json from src/cms/content.ts.
 *
 * The admin panel is plain JS with no bundler, so it cannot import the app's
 * TypeScript. This bundles DEFAULT_CONTENT once at build time instead of
 * keeping a second copy of the copy by hand.
 *
 * JSON.stringify quietly drops the function values in `translations`
 * (orderItems, allRightsReserved) — exactly right: the panel must not edit
 * them, and the app merges them back from its own defaults at runtime.
 */
import { build } from "esbuild"; // already installed — Vite depends on it
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = await mkdtemp(join(tmpdir(), "naan-defaults-"));
const outfile = join(dir, "content.mjs");

await build({
  entryPoints: ["src/cms/content.ts"],
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  logLevel: "warning",
});

const { DEFAULT_CONTENT } = await import(pathToFileURL(outfile).href);
await mkdir("public/admin", { recursive: true });
await writeFile("public/admin/defaults.json", JSON.stringify(DEFAULT_CONTENT, null, 2));
await rm(dir, { recursive: true, force: true });

console.log("public/admin/defaults.json written");
