import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const pdfParse = require('pdf-parse');

// Ometem la validació bloquejant de Prisma (AiUsageLog) per evitar l'error 500 si la taula no està llesta.

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "https://projectexinoxano.com",
    "X-Title": "PXX Dashboard",
  },
});

export const maxDuration = 60; // Permite que la función dure hasta 60 segundos (para Vercel/Next.js)

export async function POST(req: Request) {
  try {
    // 1. RECOLLIDA DE FITXER (FormData en lloc de JSON)
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ success: false, error: "No s'ha pujat cap document." }, { status: 400 });
    }

    // 2. BLINDATGE DE SEGURETAT (Directiva: Només PDF/TXT)
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        return NextResponse.json(
          { success: false, error: "Format no suportat. Només s'accepten documents de text (.txt) i PDF (.pdf). Les imatges i vídeos estan bloquejats." }, 
          { status: 415 }
        );
    }

    // Extracció del text del fitxer 
    let contextText = '';
    
    if (file.type === 'application/pdf') {
        // Conversió a Buffer per a pdf-parse
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(buffer);
        contextText = pdfData.text;
    } else {
        // Text pla
        contextText = await file.text();
    }

    // Neteja bàsica per estalviar tokens i soroll
    contextText = contextText.replace(/\n+/g, ' ').trim();

    // Limitamos el texto para no exceder el contexto del LLM y evitar timeouts
    const safeContext = contextText.substring(0, 15000);

    // 3. ENGINYERIA DE PROMPT ESTRICTA (STRICT GROUNDING)
    const systemPrompt = `
      ERES UN EXTRACTOR DE DATOS ESTRICTO PARA USO INSTITUCIONAL B2G.
      Tu única función es leer el documento proporcionado y estructurar la información en un JSON.
      
      REGLAS INQUEBRANTABLES:
      1. NO INVENTES NADA. Todo punto de interés (POI) DEBE existir explícitamente en el texto original.
      2. Si el texto original no proporciona coordenadas exactas, déjalas a null o aproxima solo a nivel del municipio, pero NUNCA inventes ubicaciones falsas.
      3. No agregues monumentos, museos o puentes que no se mencionen en el documento.
      
      A partir de los documentos proporcionados, extrae puntos de interés (POIs) reales.
      Retorna NOMÉS un JSON válido con esta estructura exacta, sin ningún código markdown de formato (ex: \`\`\`json):
      {
        "title": "Títol de la Ruta (basado en el documento)",
        "description": "Descripció general basada en el texto",
        "pois": [
          {
            "nom": "Nom del Punt d'Interès (extraído del texto)",
            "descripcio": "Breve explicación histórica (extraída fielmente del texto)",
            "coordenades": {"lat": 42.0, "lng": 1.0}, // Pon null si no puedes deducirlo de forma segura
            "idees_imatges": "Instrucció visual de qué foto hacer en ESE lugar real",
            "idees_reels_video": "Idea de guion corto para un vídeo de 15s en ESE lugar real",
            "enllac_historic": "Contexto histórico literal o resumido del texto original"
          }
        ]
      }
    `;

    // 4. GENERACIÓ (OpenRouter)
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL_ID || "qwen/qwen-2.5-72b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analitza aquest document municipal i crea la ruta. Document: ${safeContext}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Temperatura baixa per a màxim determinisme
    });

    const rawContent = completion.choices[0].message.content || "{}";
    
    // Neteja per seguretat per si l'LLM afegeix markdown trencant el JSON
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const sanitizedData = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, data: sanitizedData });

  } catch (error: any) {
    console.error("AI Route Fatal Error:", error);
    // GARANTIZAMOS QUE EL ERROR SEA JSON Y NO HTML
    return new Response(
      JSON.stringify({ success: false, error: "Error interno procesando el documento: " + (error.message || "Fallo desconocido") }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
