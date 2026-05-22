import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mundialpicks2026.com"),

  title: {
    default: "Mundial Picks 2026 | Predicciones del Mundial",
    template: "%s | Mundial Picks 2026",
  },

  description:
    "Haz tus predicciones del Mundial 2026, arma tu bracket, compite en el ranking mundial y participa por el premio de $20,000 MXN.",

  applicationName: "Mundial Picks 2026",

  authors: [{ name: "Mundial Picks" }],

  creator: "Mundial Picks",

  publisher: "Mundial Picks",

  category: "sports",

  keywords: [
    "Mundial 2026",
    "Mundial Picks 2026",
    "predicciones Mundial 2026",
    "bracket Mundial 2026",
    "ranking Mundial 2026",
    "quiniela Mundial 2026",
    "pronósticos Mundial 2026",
    "FIFA World Cup 2026",
    "Copa Mundial 2026",
    "simulador Mundial 2026",
    "competencia de predicciones",
  ],

  openGraph: {
    title: "Mundial Picks 2026 | Predicciones del Mundial",

    description:
      "Predice el Mundial 2026, compite en el ranking mundial y participa por $20,000 MXN.",

    url: "https://mundialpicks2026.com",

    siteName: "Mundial Picks 2026",

    locale: "es_MX",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Mundial Picks 2026 | Predicciones del Mundial",

    description:
      "Haz tu bracket del Mundial 2026, compite en el ranking mundial y participa por $20,000 MXN.",
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}