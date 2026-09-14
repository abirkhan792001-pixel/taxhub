import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Inter, Literata, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

// site + app
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["500", "600"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"] });
// the printable one-pager keeps its own document typography
const literata = Literata({ variable: "--font-literata", subsets: ["latin"], weight: ["400", "500", "600"] });
const schibsted = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaxHub – Das KI-Sekretariat für Ihre Steuerkanzlei",
  description:
    "TaxHub nimmt Mandantenanfragen entgegen, berechnet Fristen nachvollziehbar und beantwortet Fachfragen mit Fundstelle – aus amtlichem Gesetzestext und dem Kanzlei-Handbuch.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${cormorant.variable} ${inter.variable} ${plexMono.variable} ${literata.variable} ${schibsted.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
