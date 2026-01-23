import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Basic Meta Tags
  title: "Mistic Pallars",
  description: "Explora misterios ancestrales del Pallars. Dragones, fantasmas y tesoros ocultos te esperan. ¿Te atreves a descubrir qué leyendas esconde tu tierra? 🏔️✨",
  
  // Keywords for SEO
  keywords: [
    "leyendas del Pallars",
    "turismo cultural Pallars",
    "Mistic Pallars",
    "mitología catalana",
    "Drac de la Noguera",
    "leyendas catalanas",
    "Pallars Sobirà",
    "Pallars Jussà",
    "turismo Pirineos",
    "folklore catalán",
    "patrimonio cultural Pallars",
  ],
  
  // Authors and Creator
  authors: [{ name: "Mistic Pallars" }],
  creator: "Mistic Pallars",
  publisher: "Mistic Pallars",
  
  // Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    title: "Mistic Pallars",
    description: "Cada rincón del Pallars esconde una historia. Descubre dragones, fantasmas y tesoros a través de una experiencia interactiva única.",
    url: "https://projectexinoxano.cat",
    siteName: "Mistic Pallars",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mistic Pallars",
      },
    ],
    locale: "ca_ES",
    type: "website",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Mistic Pallars",
    description: "Explora misterios ancestrales del Pallars. Dragones, fantasmas y tesoros ocultos te esperan. 🏔️✨",
    images: ["/og-image.jpg"],
    creator: "@misticpallars",
  },
  
  // Additional Meta Tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification and Analytics
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
  },
  
  // App-specific
  applicationName: "Mistic Pallars",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mistic Pallars",
  },
  
  // Manifest and Icons
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  
  // Theme Color
  themeColor: "#1a1a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Geocontent - Leyendas del Pallars",
              description: "Aplicación interactiva para descubrir leyendas y mitos del Pallars",
              applicationCategory: "TravelApplication",
              operatingSystem: "Web, iOS, Android",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "127",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "42.4",
                longitude: "1.0",
              },
              areaServed: {
                "@type": "Place",
                name: "Pallars, Catalunya",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
