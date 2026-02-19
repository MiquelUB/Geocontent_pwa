import OpenAI from 'openai';

let openRouter: OpenAI | null = null;

function getOpenRouter() {
  if (!openRouter) {
    openRouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || 'sk-placeholder', // Prevent SDK from throwing "Missing credentials"
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://geocontent.app',
        'X-Title': 'Geocontent',
      },
    });
  }
  return openRouter;
}

export async function generateExecutiveSummary(data: any): Promise<string> {
  try {
    const client = getOpenRouter();
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3-70b-instruct",
      messages: [
        {
          role: "system",
          content: "Ets un consultor de turisme expert. Analitza aquestes dades JSON (afluència, hores punta) i redacta un resum executiu per a un Alcalde. Sigues breu, directe i propositiu. Utilitza un to institucional però modern."
        },
        {
          role: "user",
          content: JSON.stringify(data)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || "No s'ha pogut generar el resum.";
  } catch (error) {
    console.error("Error generating executive summary:", error);
    throw new Error("Failed to generate summary via OpenRouter");
  }
}
