/**
 * PXX API — Municipalities Endpoint
 * GET /api/municipalities — List all municipalities
 * 
 * Query params:
 *   ?lang=<ca|es|fr|en> — Language for translated fields
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/database/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "ca";

  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("municipalities")
    .select(`
      *,
      routes:routes(count)
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("[API /municipalities] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const localizedData = data?.map((muni) => ({
    ...muni,
    name: getTranslation(muni.name, muni.name_translations, lang),
  }));

  return NextResponse.json(localizedData);
}

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
