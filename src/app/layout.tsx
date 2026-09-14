import type { Metadata } from "next";
import { IBM_Plex_Mono, Literata, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const literata = Literata({ variable: "--font-literata", subsets: ["latin"], weight: ["400", "500", "600"] });
const schibsted = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "TaxHub – Kanzlei-Wissen mit Quellen",
  description:
    "Source-cited assistant for German tax advisory firms: answers grounded in AO, EStG, UStG, StBVV and the firm's own handbook, plus AI intake for client requests.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${literata.variable} ${schibsted.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
