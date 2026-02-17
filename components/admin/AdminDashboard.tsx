'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteLegend, createLegend, updateLegend } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/database/supabase/client";
import { supabase } from "@/lib/database/supabase/client";

export default function AdminDashboard({ legends, profiles }: { legends: any[], profiles: any[] }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLegend, setEditingLegend] = useState<any>(null);

  async function handleDelete(id: string) {
    if(!confirm("Estàs segur que vols esborrar aquesta llegenda?")) return;
    
    await deleteLegend(id);
    router.refresh();
  }

  function handleEditClick(legend: any) {
    setEditingLegend(legend);
    setIsDialogOpen(true);
  }

  function handleCreateClick() {
    setEditingLegend(null);
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    // const supabase = createClient(); // Removed to use singleton

    // Helper to upload file and get URL
    const uploadFile = async (file: File | null) => {
        if (!file || file.size === 0) return '';
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('legendes')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('legendes')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    try {
        const imageFile = formData.get('image') as File;
        const heroImageFile = formData.get('hero_image') as File;
        const audioFile = formData.get('audio') as File;

        // Upload files if they exist
        if (imageFile && imageFile.size > 0) {
            const imageUrl = await uploadFile(imageFile);
            formData.set('image_url', imageUrl);
        }
        
        if (heroImageFile && heroImageFile.size > 0) {
            const heroImageUrl = await uploadFile(heroImageFile);
            formData.set('hero_image_url', heroImageUrl);
        }

        if (audioFile && audioFile.size > 0) {
            const audioUrl = await uploadFile(audioFile);
            formData.set('audio_url', audioUrl);
        }

        // Remove raw files from formData passed to server action to avoid payload limits
        formData.delete('image');
        formData.delete('hero_image');
        formData.delete('audio');

        let result;
        if (editingLegend) {
            result = await updateLegend(editingLegend.id, formData);
        } else {
            result = await createLegend(formData);
        }

        if (result.success) {
            setIsDialogOpen(false);
            setEditingLegend(null);
            router.refresh(); 
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
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-pallars-green mb-8">
        Panell d'Administració
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Llegendes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-pallars-green">
              {legends?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuaris Registrats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-pallars-brown">
              {profiles?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
                Imatges
             </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold font-serif text-purple-600">
                Storage
             </div>
             <p className="text-xs text-muted-foreground mt-1">Bucket: legendes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="legends" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="legends">Llegendes</TabsTrigger>
          <TabsTrigger value="users">Usuaris</TabsTrigger>
        </TabsList>
        
        <TabsContent value="legends">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestió de Llegendes</CardTitle>
              <Button onClick={handleCreateClick} className="bg-pallars-green text-pallars-cream hover:bg-pallars-green/90">
                Nova Llegenda +
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left border-b">
                      <th className="p-4 font-medium">Títol</th>
                      <th className="p-4 font-medium">Categoria</th>
                      <th className="p-4 font-medium">Ubicació</th>
                      <th className="p-4 font-medium text-right">Accions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legends?.map((legend: any) => (
                      <tr key={legend.id} className="border-b last:border-0 hover:bg-muted/10">
                        <td className="p-4 font-medium">{legend.title}</td>
                        <td className="p-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-pallars-green/10 text-pallars-green">
                                {legend.category}
                            </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{legend.location_name}</td>
                        <td className="p-4 text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(legend)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(legend.id)}
                          >
                            Esborrar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!legends || legends.length === 0) && (
                        <tr>
                            <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                No hi ha llegendes. Afegeix-ne una!
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Dialog for Create/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                <DialogTitle>{editingLegend ? 'Editar Llegenda' : 'Afegir Nova Llegenda'}</DialogTitle>
                <DialogDescription>
                    Omple el formulari per {editingLegend ? 'actualitzar la' : 'crear una nova'} llegenda. Les coordenades s'han de posar en format decimal (WGS84).
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Títol</Label>
                    <Input id="title" name="title" defaultValue={editingLegend?.title} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Categoria</Label>
                    <select 
                        id="category" 
                        name="category" 
                        defaultValue={editingLegend?.category || "Criatures"}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                        required
                    >
                    <option value="Criatures">Criatures</option>
                    <option value="Fantasmes">Fantasmes</option>
                    <option value="Tresors">Tresors</option>
                    <option value="Màgia">Màgia</option>
                    </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Lloc</Label>
                    <Input id="location" name="location_name" defaultValue={editingLegend?.location_name} placeholder="Pueblo, Zona..." className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Coords</Label>
                    <div className="col-span-3 flex gap-2">
                        <div className="flex-1">
                            <Label className="text-xs text-muted-foreground mb-1 block">Latitud (ej. 42.123)</Label>
                            <Input name="latitude" defaultValue={editingLegend?.latitude} placeholder="42.xxx" type="number" step="any" required />
                        </div>
                        <div className="flex-1">
                            <Label className="text-xs text-muted-foreground mb-1 block">Longitud (ej. 0.8xx)</Label>
                            <Input name="longitude" defaultValue={editingLegend?.longitude} placeholder="0.xxx" type="number" step="any" required />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">Icono (1:1)</Label>
                    <div className="col-span-3">
                        <Input id="image" name="image" type="file" accept="image/*" />
                        {editingLegend?.image_url && (
                             <p className="text-xs text-muted-foreground mt-1">Actual: <a href={editingLegend.image_url} target="_blank" className="underline">Ver imagen</a></p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hero_image" className="text-right">Cabecera (16:9)</Label>
                    <div className="col-span-3">
                        <Input id="hero_image" name="hero_image" type="file" accept="image/*" />
                        {editingLegend?.hero_image_url && (
                             <p className="text-xs text-muted-foreground mt-1">Actual: <a href={editingLegend.hero_image_url} target="_blank" className="underline">Ver imagen</a></p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="audio" className="text-right">Audio (MP3)</Label>
                    <div className="col-span-3">
                        <Input id="audio" name="audio" type="file" accept="audio/*" />
                        {editingLegend?.audio_url && (
                             <p className="text-xs text-muted-foreground mt-1">Audio cargado ✅</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="video_url" className="text-right">Video URL</Label>
                    <Input id="video_url" name="video_url" defaultValue={editingLegend?.video_url} placeholder="https://youtube.com/..." className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="desc" className="text-right">Descripció</Label>
                    <Textarea id="desc" name="description" defaultValue={editingLegend?.description} className="col-span-3" required />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Guardant...' : 'Guardar Llegenda'}
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <TabsContent value="users">

          <Card>
            <CardHeader>
              <CardTitle>Usuaris</CardTitle>
            </CardHeader>
            <CardContent>
             <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left border-b">
                      <th className="p-4 font-medium">Username</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Nivell</th>
                      <th className="p-4 font-medium">Fecha de Alta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles?.map((profile: any) => (
                      <tr key={profile.id} className="border-b last:border-0">
                        <td className="p-4 font-medium">{profile.username || 'Anonymous'}</td>
                        <td className="p-4 text-muted-foreground">{profile.email || '-'}</td>
                        <td className="p-4">{profile.role}</td>
                        <td className="p-4">Lvl {profile.level}</td>
                        <td className="p-4 text-muted-foreground">
                          {profile.created_at 
                            ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
