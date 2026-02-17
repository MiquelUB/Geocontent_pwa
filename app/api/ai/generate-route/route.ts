import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/database/prisma'; // Assegura't que la ruta sigui correcta segons el teu projecte

// Configuració Sobirana (OpenRouter)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "https://projectexinoxano.com",
    "X-Title": "PXX Dashboard",
  },
});

const MONTHLY_LIMIT = 50; // Límit del Pla Base

export async function POST(req: Request) {
  try {
    // 1. VERIFICACIÓ DE QUOTA (El Comptador)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usageCount = await prisma.aiUsageLog.count({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'success'
      }
    });

    if (usageCount >= MONTHLY_LIMIT) {
      return NextResponse.json(
        { success: false, error: "Límit mensual assolit. Contacta amb suport per ampliar." },
        { status: 429 }
      );
    }

    // 2. PREPARACIÓ DE LA PETICIÓ
    const body = await req.json();
    const { contextText, type, prompt } = body;

    // Allow 'prompt' to be used as 'contextText' if provided
    const userContent = prompt || contextText || "";
    const routeType = type || "ruta_general";

    if (!userContent) {
        return NextResponse.json({ success: false, error: "Falta el prompt o context." }, { status: 400 });
    }

    const systemPrompt = `
      Ets un expert en turisme. Genera una ruta basada en el text proporcionat.
      Retorna NOMÉS un JSON vàlid amb aquesta estructura, sense markdown:
      {
        "title": "Títol de la Ruta",
        "description": "Descripció curta (max 200 caràcters)",
        "duration": "2h",
        "difficulty": "baixa",
        "pois": [
          {"title": "Nom Punt", "description": "Breu explicació", "lat": 41.0, "lng": 1.0}
        ]
      }
    `;

    // 3. GENERACIÓ (OpenRouter / Qwen / Kimi)
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL_ID || "qwen/qwen-2.5-72b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context/Instrucció: ${userContent.substring(0, 15000)}. Tipus: ${routeType}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const rawContent = completion.choices[0].message.content;
    const sanitizedData = JSON.parse(rawContent || "{}");

    // 4. REGISTRE D'ÚS (Auditoria)
    await prisma.aiUsageLog.create({
      data: {
        action: 'generate_route',
        status: 'success',
        // userId: session.user.id // Si tens auth implementada
      }
    });

    return NextResponse.json({ success: true, data: sanitizedData, usage: usageCount + 1, limit: MONTHLY_LIMIT });

  } catch (error) {
    console.error("AI Error:", error);
    // Best effort logging for failure
    try {
        await prisma.aiUsageLog.create({ data: { action: 'generate_route', status: 'failed' }});
    } catch (logError) {
        console.error("Failed to log usage failure:", logError);
    }
    return NextResponse.json({ success: false, error: "Error de servei." }, { status: 500 });
  }
}
