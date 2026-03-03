import { NextResponse } from 'next/server';
import { generateFinalRouteQuiz } from '@/lib/services/openrouter';

export async function POST(req: Request) {
    try {
        const { title, pois } = await req.json();

        if (!pois || pois.length === 0) {
            return NextResponse.json({ success: false, error: "No hi ha punts per generar el quiz." }, { status: 400 });
        }

        const quiz = await generateFinalRouteQuiz(title, pois);

        if (!quiz || !quiz.preguntes) {
            return NextResponse.json({ success: false, error: "Error generant el quiz AI de la ruta." }, { status: 500 });
        }

        return NextResponse.json({ success: true, quiz });
    } catch (error: any) {
        console.error("AI Route Quiz Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
