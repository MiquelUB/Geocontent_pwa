'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, UploadCloud, AlertCircle } from "lucide-react";

export default function AiRouteGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Validació ràpida al frontend
      if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
        setError("Format invàlid. Només es permeten fitxers PDF o TXT.");
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  async function handleGenerate() {
    console.log("handleGenerate called", file);
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log("Sending request to /api/ai/generate-route...");
      const response = await fetch('/api/ai/generate-route', {
        method: 'POST',
        body: formData, 
      });

      console.log("Response status:", response.status);

      // 1. BLINDATGE: Comprovem el tipus de contingut ABANS de fer .json()
      const contentType = response.headers.get("content-type");
      
      // Si el servidor falla (400, 500)
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
           // Si el backend ha controlat l'error i retorna JSON
           const errData = await response.json();
           throw new Error(errData.error || 'Error al servidor generant la ruta');
        } else {
           // HARD CRASH: El backend ha mort i Next.js escup HTML
           const errText = await response.text();
           console.error("HTML Fatal Error:", errText.substring(0, 500) + "..."); // Imprimeix un tros de l'HTML per depurar
           throw new Error(`Col·lapse del Servidor (HTTP ${response.status}). El backend no ha retornat JSON. Revisa el terminal de Node/Next.js.`);
        }
      }

      // 2. Si l'status és OK (200), ja podem parsejar tranquils
      const data = await response.json(); 
      console.log("Response data:", data);

      setResult(data.data); 
      console.log("Set result to:", data.data);
      
    } catch (err: any) {
      console.error("Error in handleGenerate:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Targeta de Pujada de Fitxers */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-serif text-terracotta-700">
            <FileText className="h-5 w-5" />
            Analista de Documents
          </CardTitle>
          <CardDescription>
            Puja documentació històrica municipal. El motor d'IA extraurà els punts d'interès i prepararà el guió audiovisual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-stone-50">
            <UploadCloud className="h-10 w-10 text-stone-400 mb-2" />
            <p className="text-sm text-stone-600 mb-4">Arrossega o selecciona un fitxer (Només PDF o TXT)</p>
            <input 
              type="file" 
              accept=".pdf, .txt" 
              onChange={handleFileChange}
              className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-terracotta-50 file:text-terracotta-700 hover:file:bg-terracotta-100"
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !file}
            className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Llegint arxiu i generant Ruta... (10-20s)
              </>
            ) : (
              'Processar Document i Crear Ruta'
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Avís de Seguretat</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Targeta de Resultats amb el nou format */}
      {result && (
        <Card className="border-stone-200 bg-stone-50 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-serif text-xl">{result.title}</CardTitle>
                <CardDescription>{result.description}</CardDescription>
            </div>
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                className="ml-4"
            >
                Copiar JSON
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase text-stone-500 border-b border-stone-200 pb-2">
                Punts d'Interès Extrets ({result.pois?.length || 0})
              </h4>
              <ul className="space-y-6">
                {result.pois?.map((poi: any, idx: number) => (
                  <li key={idx} className="bg-white p-4 rounded-md border border-stone-200 shadow-sm">
                    <h5 className="font-bold text-stone-800 text-lg">{poi.nom}</h5>
                    <p className="text-sm text-stone-600 mt-1 mb-3">{poi.descripcio}</p>
                    
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="bg-stone-50 p-2 rounded">
                        <span className="font-bold text-terracotta-600 block mb-1">📸 Idea Imatge:</span>
                        {poi.idees_imatges}
                      </div>
                      <div className="bg-stone-50 p-2 rounded">
                        <span className="font-bold text-terracotta-600 block mb-1">🎥 Guió Reel (15s):</span>
                        {poi.idees_reels_video}
                      </div>
                      <div className="bg-stone-50 p-2 rounded">
                        <span className="font-bold text-stone-600 block mb-1">📜 Context Històric:</span>
                        <span className="italic">{poi.enllac_historic}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-stone-400 hover:text-stone-600">Veure JSON Cru (Debug)</summary>
                <pre className="mt-2 p-2 bg-slate-950 text-slate-50 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
