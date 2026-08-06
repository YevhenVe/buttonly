import type { DescriptionFont } from "./types";

/** CSS font-family values mapped from description font ids */
export function descriptionFontFamily(font: DescriptionFont): string {
  switch (font) {
    case "inter":
      return "var(--font-inter), system-ui, sans-serif";
    case "serif":
      return "var(--font-source-serif), Georgia, 'Times New Roman', serif";
    case "mono":
      return "var(--font-geist-mono), ui-monospace, monospace";
    case "geist":
    default:
      return "var(--font-geist-sans), system-ui, sans-serif";
  }
}
