'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Upload } from "lucide-react";
import { getMunicipalities, updateMunicipality, uploadFile } from "@/lib/actions";

export default function MunicipalityManager({ municipalityId }: { municipalityId?: string }) {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeId, setThemeId] = useState('mountain');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [muniId, setMuniId] = useState(municipalityId || '');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const munis = await getMunicipalities();
      if (munis && munis.length > 0) {
        const target = muniId ? munis.find(m => m.id === muniId) : munis[0];
        if (target) {
          setName(target.name);
          setLogoUrl(target.logoUrl || '');
          setThemeId((target as any).themeId || 'mountain');
          setMuniId(target.id);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [muniId]);

  async function handleSave() {
    if (!muniId || !name) return;
    setIsSaving(true);
    
    let finalLogoUrl = logoUrl;
    if (logoFile) {
        const up = await uploadFile(logoFile);
        if (up) finalLogoUrl = up;
    }

    console.log('>>> [CLIENT] Calling API with:', { id: muniId, name, logoUrl: finalLogoUrl, themeId });
    
    // Call via API instead of Server Action to debug {} issues
    const apiRes = await fetch('/api/admin/municipality', {
      method: 'POST',
      body: JSON.stringify({ id: muniId, name, logoUrl: finalLogoUrl, themeId }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    let res: any;
    try {
      res = await apiRes.json();
    } catch (e) {
      const text = await apiRes.text();
      res = { success: false, error: 'Invalid JSON response from server', details: text };
    }
    
    console.log('>>> [CLIENT] Received response:', res);

    if (res && (res as any).success) {
      alert('Configuració de Marca Blanca actualitzada!');
      if (finalLogoUrl) setLogoUrl(finalLogoUrl);
      setLogoFile(null);
    } else {
      console.error('>>> [CLIENT] Save failed:', res);
      const errorMsg = (res as any)?.error || 'Unknown error during save';
      alert('Error: ' + errorMsg + '\n\nFull response: ' + JSON.stringify(res));
    }
    setIsSaving(false);
  }

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Label>Logo de la Marca Blanca</Label>
        <div className="flex items-center gap-4">
            {logoUrl && (
                <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
            )}
            <div className="flex-1">
                <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                />
            </div>
        </div>
        <p className="text-[10px] text-stone-400 italic">Puja el logo oficial (PNG o SVG preferiblement).</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="muniName">Nom de l'Entitat / Marca Blanca</Label>
        <Input 
          id="muniName" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Ex: Ajuntament de Sort" 
        />
        <p className="text-[10px] text-stone-400 italic">Aquest és el nom principal de l'aplicació.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="globalTheme">Temàtica Visual de l'App (Pell)</Label>
        <select 
          id="globalTheme" 
          value={themeId} 
          onChange={(e) => setThemeId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2"
        >
          <option value="mountain">Muntanya (Verd)</option>
          <option value="coast">Costa (Blau)</option>
          <option value="city">Ciutat (Gris)</option>
          <option value="interior">Interior (Marró)</option>
          <option value="bloom">Floració (Rosa)</option>
        </select>
        <p className="text-[10px] text-stone-400 italic">Aquesta temàtica s'aplicarà a tota l'experiència de l'usuari.</p>
      </div>

      <Button onClick={handleSave} disabled={isSaving || !name} className="bg-stone-800 text-white hover:bg-stone-900">
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Guardar Canvis
      </Button>
    </div>
  );
}
