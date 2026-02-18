import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { PxxConfig } from "@/projects/active/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: PxxConfig.appName,
  description: PxxConfig.appDescription,
  keywords: PxxConfig.metadata.keywords,
  authors: [{ name: PxxConfig.metadata.creator }],
  creator: PxxConfig.metadata.creator,
  publisher: PxxConfig.metadata.publisher,
  openGraph: {
    title: PxxConfig.appName,
    description: PxxConfig.appDescription,
    url: PxxConfig.metadata.url,
    siteName: PxxConfig.appName,
    images: [
      {
        url: PxxConfig.metadata.ogImage,
        width: 1200,
        height: 630,
        alt: PxxConfig.appName,
      },
    ],
    locale: PxxConfig.metadata.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PxxConfig.appName,
    description: PxxConfig.appDescription,
    images: [PxxConfig.metadata.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  themeColor: PxxConfig.theme.colors.terra,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={PxxConfig.metadata.locale.split('_')[0]}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: PxxConfig.appName,
              url: PxxConfig.metadata.url,
              description: PxxConfig.appDescription,
              applicationCategory: "TravelApplication",
              operatingSystem: "Android, iOS",
              screenshot: `${PxxConfig.metadata.url}${PxxConfig.metadata.ogImage}`,
              genre: "Folklore, Culture, Tourism",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
