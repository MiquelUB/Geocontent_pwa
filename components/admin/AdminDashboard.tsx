'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AiRouteGenerator from '@/components/admin/AiRouteGenerator';
import { UsersTable } from '@/components/admin/UsersTable';
import ExecutiveReport from '@/components/admin/ExecutiveReport';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteLegend, createLegend, updateLegend } from "@/lib/actions"; // Verify path
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/database/supabase/client";

// Import UI components for the form (reused from previous dashboard)
// In a full refactor, we would extract LegendForm to its own component.
// For now, we will inline it in the right column to keep it functional as requested.

export default function AdminDashboard({ legends, profiles, reports, municipalityId }: { legends: any[], profiles: any[], reports?: any[], municipalityId?: string }) {
  const [activeTab, setActiveTab] = useState('rutes'); // 'rutes', 'usuaris', 'executiu'
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  // Note: Original code used a Dialog. Now we want it in the right column (Split Screen).
  // We need state for the form fields if we want to "Edit".
  // For simplicity in this split-screen "Creation" focused view, we assume "New" by default,
  // but let's allow editing if someone clicks "Edit" in a list (which list? The legends list is needed).
  // Strategy: We will keep a "Legends List" below the split screen or in a separate view?
  // The user requirement says: "Columna esquerra: AiRouteGenerator... Columna dreta: Formulari".
  // It implies a workspace for CREATION.
  // But we also need to manage existing legends.
  // Let's create a mode in the "Rutes" tab: "List" vs "Workspace".
  // OR: Just show the workspace and a list below/modal.
  // Given "Split-Screen" emphasis for copying from AI, we prioritize the grid.
  
  const router = useRouter();
  const supabase = createClient();
  const [editingLegend, setEditingLegend] = useState<any>(null);

  // Reusing the submit logic
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    const uploadFile = async (file: File | null) => {
        if (!file || file.size === 0) return '';
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('legendes').upload(filePath, file);
        if (uploadError) throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('legendes').getPublicUrl(filePath);
        return publicUrl;
    };

    try {
        const imageFile = formData.get('image') as File;
        const heroImageFile = formData.get('hero_image') as File;
        const audioFile = formData.get('audio') as File;

        if (imageFile && imageFile.size > 0) formData.set('image_url', await uploadFile(imageFile));
        if (heroImageFile && heroImageFile.size > 0) formData.set('hero_image_url', await uploadFile(heroImageFile));
        if (audioFile && audioFile.size > 0) formData.set('audio_url', await uploadFile(audioFile));

        formData.delete('image');
        formData.delete('hero_image');
        formData.delete('audio');

        const result = editingLegend 
            ? await updateLegend(editingLegend.id, formData) 
            : await createLegend(formData);

        if (result.success) {
            setEditingLegend(null);
            form.reset();
            router.refresh(); 
            // Optional success toast
        } else {
            alert("Error: " + result.error);
        }
    } catch (error: any) {
        console.error("Submission error:", error);
        alert("Error: " + error.message);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 p-8 font-sans">
      {/* CAPÇALERA INSTITUCIONAL */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center border-b border-stone-200 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 tracking-tight">PXX Studio</h1>
          <p className="text-stone-500 font-serif italic">Panell de Control Institucional</p>
        </div>
        
        {/* NAVEGACIÓ SENSE IMAGE STORAGE */}
        <nav className="flex space-x-2 bg-stone-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('rutes')}
            className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium ${activeTab === 'rutes' ? 'bg-white text-terracotta-600 shadow-sm ring-1 ring-stone-200' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'}`}
          >
            Creació de Rutes
          </button>
          <button 
            onClick={() => setActiveTab('usuaris')}
            className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium ${activeTab === 'usuaris' ? 'bg-white text-terracotta-600 shadow-sm ring-1 ring-stone-200' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'}`}
          >
            Gestió d'Usuaris
          </button>
          <button 
            onClick={() => setActiveTab('executiu')}
            className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium ${activeTab === 'executiu' ? 'bg-white text-terracotta-600 shadow-sm ring-1 ring-stone-200' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'}`}
          >
            Informe Executiu
          </button>
        </nav>
      </header>

      {/* CONTINGUT DINÀMIC */}
      <main className="animate-in fade-in duration-500">
        {activeTab === 'rutes' && (
          <div className="space-y-8">
              
              {/* SPLIT SCREEN: GENERATOR + EDITOR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* COLUMNA ESQUERRA: MOTOR IA */}
                <Card className="border-stone-200 shadow-sm bg-white h-full">
                <CardHeader className="bg-stone-50/50 border-b border-stone-100 pb-4">
                    <CardTitle className="font-serif text-xl text-stone-800 flex items-center gap-2">
                        <span>🤖</span> 1. Analista Documental (IA)
                    </CardTitle>
                    <p className="text-sm text-stone-500">Puja documents PDF/TXT i obté el JSON.</p>
                </CardHeader>
                <CardContent className="p-6">
                    <AiRouteGenerator />
                </CardContent>
                </Card>

                {/* COLUMNA DRETA: FORMULARI DE LLEGENDES (POIs) */}
                <Card className="border-stone-200 shadow-sm bg-white h-full ring-1 ring-terracotta-100/50">
                <CardHeader className="bg-stone-50/50 border-b border-stone-100 pb-4">
                    <CardTitle className="font-serif text-xl text-stone-800 flex items-center gap-2">
                        <span>✍️</span> 2. Editor de Rutes
                    </CardTitle>
                    <p className="text-sm text-stone-500">Copia el JSON generat i completa el formulari.</p>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-stone-600">Títol</Label>
                            <Input id="title" name="title" defaultValue={editingLegend?.title} required className="bg-stone-50 border-stone-200 focus:border-terracotta-500 focus:ring-terracotta-500/20" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-stone-600">Categoria</Label>
                                <select 
                                    id="category" 
                                    name="category" 
                                    defaultValue={editingLegend?.category || "Criatures"}
                                    className="flex h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500" 
                                    required
                                >
                                    <option value="Criatures">Criatures</option>
                                    <option value="Fantasmes">Fantasmes</option>
                                    <option value="Tresors">Tresors</option>
                                    <option value="Màgia">Màgia</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location" className="text-stone-600">Ubicació</Label>
                                <Input id="location" name="location_name" defaultValue={editingLegend?.location_name} placeholder="p.ex. Vall Fosca" className="bg-stone-50 border-stone-200 focus:border-terracotta-500" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-stone-600">Latitud</Label>
                                <Input name="latitude" defaultValue={editingLegend?.latitude} placeholder="42.xxx" type="number" step="any" required className="bg-stone-50 border-stone-200" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-stone-600">Longitud</Label>
                                <Input name="longitude" defaultValue={editingLegend?.longitude} placeholder="0.xxx" type="number" step="any" required className="bg-stone-50 border-stone-200" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="desc" className="text-stone-600">Descripció</Label>
                            <Textarea id="desc" name="description" defaultValue={editingLegend?.description} className="min-h-[100px] bg-stone-50 border-stone-200 focus:border-terracotta-500" required />
                        </div>

                        <div className="border border-dashed border-stone-300 rounded-lg p-4 space-y-4 bg-stone-50/50">
                            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Multimèdia</p>
                            <div className="grid gap-2">
                                <Label className="text-xs">Imatge (1:1)</Label>
                                <Input name="image" type="file" accept="image/*" className="text-xs" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs">Capçalera (16:9)</Label>
                                <Input name="hero_image" type="file" accept="image/*" className="text-xs" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs">Àudio (MP3)</Label>
                                <Input name="audio" type="file" accept="audio/*" className="text-xs" />
                            </div>
                             <div className="grid gap-2">
                                <Label className="text-xs">Vídeo URL</Label>
                                <Input name="video_url" placeholder="https://..." className="text-xs bg-white" />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-md hover:shadow-lg transition-all">
                            {isLoading ? 'Guardant...' : (editingLegend ? 'Actualitzar Llegenda' : 'Crear Nova Llegenda')}
                        </Button>
                        
                        {editingLegend && (
                            <Button type="button" variant="outline" onClick={() => setEditingLegend(null)} className="w-full border-stone-200 text-stone-600">
                                Cancel·lar Edició
                            </Button>
                        )}
                    </form>
                </CardContent>
                </Card>
              </div>

              {/* LIST OF LEGENDS */}
              <Card className="border-stone-200 shadow-sm bg-white">
                  <CardHeader>
                      <CardTitle className="font-serif text-xl text-stone-800">Llistat de Llegendes Existents</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="rounded-md border border-stone-200">
                        <table className="w-full text-sm">
                          <thead className="bg-stone-50 text-stone-700">
                            <tr className="text-left border-b border-stone-200">
                              <th className="p-4 font-medium font-serif">Títol</th>
                              <th className="p-4 font-medium font-serif">Categoria</th>
                              <th className="p-4 font-medium font-serif text-right">Accions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {legends?.map((legend: any) => (
                              <tr key={legend.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                                <td className="p-4 font-medium text-stone-800">{legend.title}</td>
                                <td className="p-4 text-stone-600">{legend.category}</td>
                                <td className="p-4 text-right space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-terracotta-600 hover:text-terracotta-700 hover:bg-terracotta-50"
                                    onClick={() => {
                                        setEditingLegend(legend);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                  >
                                    Editar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-stone-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={async () => {
                                        if(confirm("Segur que vols esborrar?")) {
                                            await deleteLegend(legend.id);
                                            router.refresh();
                                        }
                                    }}
                                  >
                                    Esborrar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  </CardContent>
              </Card>
          </div>
        )}

        {activeTab === 'usuaris' && (
          <UsersTable profiles={profiles} />
        )}

        {activeTab === 'executiu' && (
            // Assuming first municipality is the target for now, or pass prop
          <ExecutiveReport municipalityId={municipalityId || ''} />
        )}
      </main>
    </div>
  );
}
