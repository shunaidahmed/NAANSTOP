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
 * Fonts: two families are in brand/fonts/ and neither is usable in full.
 *   - Supra Classic (the face in the logo) is a DEMO: all twenty files replace
 *     32 characters with a "DEMO" badge, including 4, +, and every Spanish
 *     accent. Unusable until the licensed version is bought.
 *   - Gilroy has bytes only in Bold and Black; the other sixteen files are
 *     0-byte stubs.
 * So Gilroy carries headings and the interface, and body copy falls back to
 * Manrope. Each conversion is checked for sabotaged glyphs before it runs.
 *
 * Needs fonttools: `pip install fonttools brotli`.
 */
import { execFileSync } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";

const FACES = [
  ["brand/fonts/Gilroy-Bold.ttf", "gilroy-700.woff2"],
  ["brand/fonts/Gilroy-BoldItalic.ttf", "gilroy-700-italic.woff2"],
  ["brand/fonts/Gilroy-Black.ttf", "gilroy-900.woff2"],
  ["brand/fonts/Gilroy-BlackItalic.ttf", "gilroy-900-italic.woff2"],
  // Waiting on files that are not usable yet — see the note above.
  // ["brand/fonts/Gilroy-Regular.ttf", "gilroy-400.woff2"],
  // ["brand/fonts/Gilroy-Medium.ttf", "gilroy-500.woff2"],
  // ["brand/fonts/fonnts.com-SupraClassic-Book.otf", "supra-400.woff2"],
  // ["brand/fonts/fonnts.com-SupraClassic-Black.otf", "supra-900.woff2"],
];

const PY = `
import sys
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]

# Trial fonts replace whole swathes of the character set with a "DEMO" badge.
# The Supra Classic drop did exactly that to 32 characters — including 4, +,
# and every Spanish accent — and it shipped before anyone noticed. Any font
# where distinct characters rasterise identically does not get converted.
probe = "0123456789+-!?aeiouAEIOU" + "áéíóúñ¿"
face = ImageFont.truetype(src, 44)
seen = {}
for ch in probe:
    im = Image.new("L", (80, 80), 255)
    ImageDraw.Draw(im).text((8, 8), ch, font=face, fill=0)
    seen.setdefault(im.tobytes(), []).append(ch)
clashes = [g for g in seen.values() if len(g) > 1]
if clashes:
    raise SystemExit(
        f"{src} draws the same glyph for different characters: "
        + ", ".join("".join(g) for g in clashes)
        + " — this looks like a trial version, not the licensed font."
    )

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
