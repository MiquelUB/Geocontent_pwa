/**
 * PXX API — Routes Endpoint
 * GET /api/routes — List all active routes (expired temporal routes filtered by default)
 * 
 * Query params:
 *   ?municipality=<slug>   — Filter by municipality slug
 *   ?theme=<themeId>       — Filter by Chameleon theme
 *   ?include_expired=true  — Include expired temporal routes
 *   ?lang=<ca|es|fr|en>    — Language for translated fields
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/database/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const municipality = searchParams.get("municipality");
  const theme = searchParams.get("theme");
  const includeExpired = searchParams.get("include_expired") === "true";
  const lang = searchParams.get("lang") || "ca";

  const supabase = createClient(await cookies());
  let query = supabase
    .from("routes")
    .select(`
      *,
      municipality:municipalities!routes_municipality_fk(name, slug, logo_url),
      pois(id, title, latitude, longitude, sort_order)
    `)
    .order("created_at", { ascending: false });

  // Filter by municipality
  if (municipality) {
    query = query.eq("municipality.slug", municipality);
  }

  // Filter by Chameleon theme
  if (theme) {
    query = query.eq("theme_id", theme);
  }

  // Filter expired temporal routes (DEFAULT behavior)
  if (!includeExpired) {
    const now = new Date().toISOString();
    // Keep: permanent routes, OR temporal/event routes where end_date is null or in the future
    query = query.or(`availability_type.eq.permanent,end_date.is.null,end_date.gte.${now}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[API /routes] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Apply i18n translations
  const localizedData = data?.map((route) => ({
    ...route,
    title: getTranslation(route.title, route.title_translations, lang),
    description: getTranslation(route.description, route.description_translations, lang),
  }));

  return NextResponse.json(localizedData);
}

/**
 * Helper: Get translated text or fallback to original
 */
function getTranslation(
  original: string | null,
  translations: Record<string, string> | null,
  lang: string
): string | null {
  if (!original) return null;
  if (lang === "ca") return original; // Default language, no translation needed
  if (translations && translations[lang]) return translations[lang];
  return original; // Fallback to original
}
