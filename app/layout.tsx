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
  title: "Mistic Pallars - Descobreix les Llegenda del Pallars",
  description: "Explora la màgia del Pallars Sobirà i Jussà a través de Mistic Pallars. Una guia interactiva amb mapa, àudios i vídeos de llegendes ancestrals, tresors ocults i misteris del Pirineu.",
  
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
    title: "Mistic Pallars - El Mapa de les Llegendes",
    description: "Una experiència interactiva única per descobrir el folklore i patrimoni cultural del Pallars des del teu mòbil.",
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
    title: "Mistic Pallars - La teva Guia del Pirineu",
    description: "Àudios, vídeos i mapes interactius de les llegendes del Pallars. Explora el patrimoni mistic de la teva terra. 🏔️✨",
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
              name: "Mistic Pallars",
              url: "https://projectexinoxano.cat",
              description: "Una guia interactiva de les llegendes i el folklore del Pallars Sobirà i Jussà.",
              applicationCategory: "TravelApplication",
              operatingSystem: "Android, iOS",
              screenshot: "https://projectexinoxano.cat/og-image.jpg",
              genre: "Folklore, Culture, Tourism",
              about: {
                "@type": "Thing",
                "name": "Llegendes del Pallars"
              }
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
