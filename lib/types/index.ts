// Shared type definitions for the application

export interface Legend {
  id: string;
  title: string;
  category: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  hero_image_url?: string;
  audio_url?: string;
  video_url?: string;
  description?: string;
  // Display properties
  color?: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  image?: string;
  hero?: string;
  audio?: string;
  video?: string;
  // Additional properties used by screens
  rating?: number;
  distance?: number | string;
  date?: string;
  categoryLabel?: string;
  featured?: boolean;
  visited_at?: string;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  avatar_url?: string;
}

export interface NavigationData {
  screen?: string;
  data?: unknown;
}

export type NavigateFunction = (screen: string, data?: Legend | unknown) => void;
