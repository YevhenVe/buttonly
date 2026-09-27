/**
 * Inter font buffers for OG image rendering.
 *
 * Satori (used by next/og) cannot use system fonts — every weight must be
 * supplied as an ArrayBuffer. The latin TTF files are fetched once from
 * Google Fonts and cached for the lifetime of the server instance.
 *
 * NOTE: the css2 API is queried with a neutral User-Agent on purpose.
 * A browser UA makes Google return woff2, which the font parser bundled
 * with next/og cannot read ("Unsupported OpenType signature wOF2").
 * A neutral UA returns TTF, which works.
 */

interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 800;
  style: "normal";
}

let cached: Promise<OgFont[]> | null = null;

/** Extract the TTF URL for a given weight from a css2 response. */
function ttfUrl(css: string, weight: number): string | null {
  const blocks = css.split("@font-face");
  for (let i = 1; i < blocks.length; i++) {
    const face = blocks[i].slice(0, blocks[i].indexOf("}") + 1);
    if (face.includes(`font-weight: ${weight};`)) {
      return face.match(/url\((https:[^)]+)\)/)?.[1] ?? null;
    }
  }
  return null;
}

export function getOgFonts(): Promise<OgFont[]> {
  if (!cached) {
    cached = (async () => {
      const css = await (
        await fetch(
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap",
          { headers: { "User-Agent": "Buttonly-og/1.0" } },
        )
      ).text();
      const fonts: OgFont[] = [];
      for (const weight of [400, 800] as const) {
        const url = ttfUrl(css, weight);
        if (!url)
          throw new Error(
            `Inter ${weight} TTF URL not found in css2 response`,
          );
        const data = await (await fetch(url)).arrayBuffer();
        fonts.push({ name: "Inter", data, weight, style: "normal" });
      }
      return fonts;
    })();
  }
  return cached;
}
