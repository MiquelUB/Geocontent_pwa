import { NextResponse } from 'next/server';
import { generatePoiQuiz } from '@/lib/services/openrouter';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, content, type } = body;

        if (!title || !content) {
            return NextResponse.json({
                success: false,
                error: "Manca el títol o el contingut del punt per generar el quiz."
            }, { status: 400 });
        }

        const quiz = await generatePoiQuiz(title, content, type || 'CIVIL');

        if (!quiz || Object.keys(quiz).length === 0) {
            return NextResponse.json({
                success: false,
                error: "El motor d'IA no ha pogut generar un quiz vàlid. Prova de nou."
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, quiz });
    } catch (error: any) {
        console.error("AI Quiz Route Error:", error);
        return NextResponse.json({
            success: false,
            error: "S'ha produït un error de connexió amb el servei d'IA."
        }, { status: 500 });
    }
}
