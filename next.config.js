/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require("next-intl/plugin");
const withPWA = require("next-pwa")({
  dest: "public",                 // SW output: public/sw.js, public/workbox-*.js
  disable: process.env.NODE_ENV === "development",  // No SW en dev
  register: true,                 // Auto-registra el SW al client
  skipWaiting: true,              // Activa el nou SW immediatament
  runtimeCaching: [
    // API de rutes i POIs — NetworkFirst (dades fresques, fallback cache)
    {
      urlPattern: /^https:\/\/.*\/api\/(routes|pois|legends).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pxx-api-cache",
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 }, // 24h
        networkTimeoutSeconds: 5,
      },
    },
    // Tiles CartoDB Positron — CacheFirst (estàtiques, sense canviar)
    {
      urlPattern: /^https:\/\/.*\.cartocdn\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "pxx-tiles-cache",
        expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 dies
      },
    },
    // Àudios i vídeos Supabase Storage — CacheFirst
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "pxx-media-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 dies
      },
    },
    // Pàgines Next.js — NetworkFirst
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "pxx-page-cache",
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.openstreetmap.org' },
      { protocol: 'https', hostname: 'tile.openstreetmap.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cartocdn.com' },
    ],
  },
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Suport per a múltiples fotos/àudios en ManualPoiForm
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withNextIntl(withPWA(nextConfig));

