import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Papizza | Hot pizza, loaded deals, ordered on WhatsApp",
  description:
    "Eighteen pizza flavors, five crusts and deals for every crowd. Build your order on Papizza and send it straight to us on WhatsApp.",
  openGraph: {
    title: "Papizza",
    description: "Hot, loaded and dripping with cheese. Order on WhatsApp.",
    images: [{ url: "/images/site/hero.jpg", width: 2400, height: 1600, alt: "A slice of cheese pizza lifted from the pie, cheese stretching" }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0c0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} antialiased`}>
      <body className="grain min-h-dvh overflow-x-clip">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
