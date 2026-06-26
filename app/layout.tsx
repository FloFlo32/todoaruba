import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/brand.config";
import { fontVariables } from "@/lib/fonts";
import { ThemeScript } from "@/components/theme-provider";
import { FaqWidget } from "@/components/widget/faq-widget";
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
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <FaqWidget />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
