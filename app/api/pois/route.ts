/**
 * PXX API — POIs Endpoint
 * GET /api/pois — List POIs for a specific route
 * 
 * Query params:
 *   ?route_id=<uuid>    — Required: filter by route
 *   ?lang=<ca|es|fr|en> — Language for translated fields
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/database/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("route_id");
  const lang = searchParams.get("lang") || "ca";

  if (!routeId) {
    return NextResponse.json(
      { error: "route_id parameter is required" },
      { status: 400 }
    );
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("pois")
    .select("*")
    .eq("route_id", routeId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[API /pois] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Apply i18n translations
  const localizedData = data?.map((poi) => ({
    ...poi,
    title: getTranslation(poi.title, poi.title_translations, lang),
    description: getTranslation(poi.description, poi.description_translations, lang),
    quiz_question: getTranslation(poi.quiz_question, poi.quiz_question_translations, lang),
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
  if (lang === "ca") return original;
  if (translations && translations[lang]) return translations[lang];
  return original;
}
