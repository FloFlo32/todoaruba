import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/brand.config";
import { fontVariables } from "@/lib/fonts";
import { ThemeScript } from "@/components/theme-provider";
import { WhatsAppWidget } from "@/components/widget/whatsapp-widget";

const siteUrl = `https://${brand.domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  openGraph: {
    title: brand.name,
    description: brand.description,
    url: siteUrl,
    siteName: brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
    creator: `@${brand.social.x}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`} suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* Viator's booking widget is embedded on most pages; warm the connection early so it doesn't wait until the script tag to start the handshake. */}
        <link rel="preconnect" href="https://www.viator.com" />
        <link rel="preconnect" href="https://dd.viator.com" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
