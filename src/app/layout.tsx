import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter, Source_Serif_4 } from "next/font/google";
import { AuthProvider } from "@/context/AuthProvider";
import { ageGateBootScript } from "@/lib/ageGate";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Buttonly",
    template: "%s · Buttonly",
  },
  description: "Create your personal link page",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${sourceSerif.variable}`}
    >
      <body>
        {/* Age-gate storage sync: injected via next/script afterInteractive so
            it keeps the localStorage flag and the confirm cookie in sync. The
            script never mutates the DOM (that would cause hydration
            mismatches) — it only mirrors the two storages so the next request
            goes through the server-side cookie path and the 18+ gate never
            flashes. afterInteractive (not beforeInteractive) is on purpose:
            it renders null on the client instead of a literal <script>, which
            would trigger React's "script tag inside component" warning. */}
        <Script
          id="age-gate-boot"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: ageGateBootScript }}
        />
        <AuthProvider>{children}</AuthProvider>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
