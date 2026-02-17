# GeoContent Core 🗺️

A white-label geolocation Core engine that delivers contextualized multimedia content based on user location using intelligent geofencing. This repository has been abstracted and sanitized to serve as a base for any project requiring geolocation-based content delivery.

## 🚀 Key Features

- 📍 **Generic Geolocation Architecture**: Agnostic to specific branding or regions.
- 🎯 **Intelligent Geofencing**: Powered by Turf.js for precise proximity detection.
- 🎵 **Multimedia Support**: Dynamic delivery of audio, video, images, and text.
- 🎮 **Core Gamification**: Built-in logic for levels, XP, and achievements.
- � **Progressive Web App (PWA)**: Optimized for mobile use with offline support.
- 🧩 **Plugin-based Configuration**: Swap between different client projects using the `projects/` structure.

## 🛠️ Tech Stack & Adapters

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (Aesthetic-focused)
- **Database:** Adapter-ready (Default: Supabase/PostgreSQL)
- **Geofencing:** Turf.js
- **Icons:** Lucide React

## 🔧 Workflow & Multi-Project Support

This repository is designed to be a "Core" engine. To create or use a specific project:

1. **Configurations**: All project-specific strings, themes, and identity are stored in `projects/active/config.ts`.
2. **Project Swapping**:
   - Store configurations in `projects/[project-name]/`.
   - To activate a project, copy its configuration to `projects/active/config.ts`.
3. **Internal Logic**: Components and actions import from `@/projects/active/config`, ensuring zero hardcoded branding in the Core.

## � Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   Copy `.env.example` to `.env.local` and configure your API keys (Mapbox, Database).

3. **Active Project**
   Ensure `projects/active/config.ts` contains your desired project configuration.

4. **Run Development**
   ```bash
   npm run dev
   ```

## 📁 Repository Structure

```
app/                    # Global App Router
components/             # Core UI components
lib/                    # Business logic and database adapters
projects/               # Project-specific configurations (The Plugins)
public/                 # Common static assets
```

## 📄 License

This Core engine is proprietary. All rights reserved.
