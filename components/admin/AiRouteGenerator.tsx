'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function AiRouteGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/generate-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error generating route');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ Generador de Rutes IA
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Descriu la ruta que vols i l'IA crearà el contingut, punts d'interès i història.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">El teu Prompt:</label>
            <Textarea 
              placeholder="Ex: Genera una ruta de misteri pels carrers antics de..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generant Ruta... (5-10s)
              </>
            ) : (
              'Generar Ruta Màgica'
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            <p>ℹ️ Cada generació consumeix 1 crèdit del límit mensual.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Resultat</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
               <div className="bg-white p-4 rounded-md border shadow-sm">
                  <h3 className="font-bold text-lg text-primary">{result.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline">{result.theme}</Badge>
                    <Badge variant="outline">{result.duration}</Badge>
                    <Badge variant="outline">{result.audience}</Badge>
                  </div>
                  
                  <h4 className="font-semibold mb-2 text-sm uppercase text-gray-500">Punts d'Interès ({result.pois?.length || 0})</h4>
                  <ul className="space-y-3">
                    {result.pois?.map((poi: any, idx: number) => (
                        <li key={idx} className="text-sm border-l-2 border-primary pl-3">
                            <span className="font-bold block">{poi.title}</span>
                            <span className="text-gray-600">{poi.description}</span>
                        </li>
                    ))}
                  </ul>
               </div>

               <div className="mt-4">
                  <details className="text-xs text-muted-foreground cursor-pointer">
                    <summary>Veure JSON Tècnic</summary>
                    <pre className="mt-2 p-2 bg-slate-950 text-slate-50 rounded overflow-auto max-h-[300px]">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[300px]">
                <p>El resultat apareixerà aquí...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
