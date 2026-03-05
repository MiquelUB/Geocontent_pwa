import { NextResponse } from 'next/server';
import { updateMunicipality } from '@/lib/actions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, logoUrl, themeId, adminMasterPassword, planTier, extraRoutesCount } = body;

    // Strict Validation for Audit TC002
    if (!id || !name) {
      return NextResponse.json({
        success: false,
        error: "Mancan camps obligatoris (ID o Nom)."
      }, { status: 400 });
    }

    const res = await updateMunicipality(id, name, logoUrl, themeId, adminMasterPassword, planTier, extraRoutesCount);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
