/**
 * Fonts are loaded with next/font (zero layout shift, self-hosted, no FOUT).
 *
 * next/font requires STATIC imports — it can't read a runtime variable — so the
 * font names here are kept in sync with brand.config.ts by `npm run brand`,
 * which rewrites the block between the markers below. To change fonts: edit
 * brand.config.ts → run `npm run brand`.  (Or just edit here directly.)
 */
// brand:fonts:start
import { Space_Grotesk, Geist, JetBrains_Mono } from "next/font/google";

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
// brand:fonts:end

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`;
