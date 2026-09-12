/**
 * brand/ (design sources) -> public/ (what the site serves).
 *
 *   npm run brand
 *
 * Logo: the badge in brand/logo/ has its wordmark *knocked out* rather than
 * painted white — on a light page the holes read as white lettering, on a dark
 * page the name disappears into the background. So the disc is filled with
 * white behind the badge before it is written out, and the result is asserted
 * to actually contain white pixels.
 *
 * Supra Classic is the face in the logo and carries headings and body copy.
 * Gilroy carries the interface. Gilroy currently ships only Bold and Black —
 * the other sixteen files in brand/fonts/ are 0-byte stubs — so the entries
 * below are commented out rather than deleted: drop the full family in and
 * uncomment them, then point --font-body at Gilroy in src/index.css.
 *
 * Needs fonttools: `pip install fonttools brotli`.
 */
import { execFileSync } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";

const FACES = [
  ["brand/fonts/fonnts.com-SupraClassic-Book.otf", "supra-400.woff2"],
  ["brand/fonts/fonnts.com-SupraClassic-Medium.otf", "supra-500.woff2"],
  ["brand/fonts/fonnts.com-SupraClassic-Bold.otf", "supra-700.woff2"],
  ["brand/fonts/fonnts.com-SupraClassic-Black.otf", "supra-900.woff2"],
  ["brand/fonts/fonnts.com-SupraClassic-Blacktalic.otf", "supra-900-italic.woff2"],
  ["brand/fonts/Gilroy-Bold.ttf", "gilroy-700.woff2"],
  ["brand/fonts/Gilroy-Black.ttf", "gilroy-900.woff2"],
  // ["brand/fonts/Gilroy-Regular.ttf", "gilroy-400.woff2"],
  // ["brand/fonts/Gilroy-Medium.ttf", "gilroy-500.woff2"],
];

const PY = `
import sys
from fontTools.ttLib import TTFont
src, out = sys.argv[1], sys.argv[2]
f = TTFont(src)
f.flavor = "woff2"
f.save(out)
`;

await mkdir("public/fonts", { recursive: true });

for (const [src, name] of FACES) {
  const size = await stat(src).then((s) => s.size, () => -1);
  if (size <= 0) {
    console.warn(`skipped ${src} — ${size < 0 ? "missing" : "0 bytes"}`);
    continue;
  }
  execFileSync("python", ["-c", PY, src, `public/fonts/${name}`], { stdio: "inherit" });
  const out = await stat(`public/fonts/${name}`);
  console.log(`public/fonts/${name}  ${Math.round(out.size / 1024)} KB`);
}

/* ── logo ──────────────────────────────────────────────────────────── */
const LOGO_PY = `
from PIL import Image, ImageDraw

badge = Image.open("brand/logo/logo-round.png").convert("RGBA")
badge = badge.crop(badge.getchannel("A").getbbox())

mask = Image.new("L", badge.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, badge.width - 1, badge.height - 1), fill=255)
plate = Image.new("RGBA", badge.size, (255, 255, 255, 255))
plate.putalpha(mask)
plate.alpha_composite(badge)

logo = plate.copy()
logo.thumbnail((256, 256), Image.LANCZOS)
logo.save("public/logo.png", optimize=True, compress_level=9)

# Palette quantising has eaten the wordmark twice: the name is a small share of
# the pixels, so median-cut merges it into the dark fill. Fail loudly instead.
check = Image.open("public/logo.png").convert("RGBA")
white = sum(1 for r, g, b, a in check.get_flattened_data() if a > 40 and r > 200 and g > 200 and b > 200)
assert white > 500, f"the wordmark is missing from public/logo.png ({white} white pixels)"

icon = Image.new("RGBA", plate.size, (18, 15, 20, 255))
icon.alpha_composite(plate)
icon.resize((180, 180), Image.LANCZOS).convert("RGB").save("public/favicon.png", optimize=True)
print(f"public/logo.png {check.size[0]}px, {white} white pixels")
`;

execFileSync("python", ["-c", LOGO_PY], { stdio: "inherit" });
