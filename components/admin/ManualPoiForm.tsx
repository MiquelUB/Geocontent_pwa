'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Plus, Music, Film, ImageIcon, History, MapPin, FolderIcon, Upload, Link2, Trash2 } from "lucide-react";

interface ManualPoiFormProps {
  poi?: any;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  routes?: any[];
  defaultRouteId?: string;
}

interface VideoSlot {
  url: string;
  file: File | null;
  mode: 'url' | 'file';
}

const MAX_VIDEO_SLOTS = 3;
const MAX_VIDEO_SIZE_MB = 15;

export default function ManualPoiForm({ poi, onSave, onCancel, isLoading, routes = [], defaultRouteId }: ManualPoiFormProps) {
  const [title, setTitle] = useState(poi?.title || '');
  const [description, setDescription] = useState(poi?.description || '');
  const [routeId, setRouteId] = useState(poi?.routeId || defaultRouteId || '');
  const [textContent, setTextContent] = useState(poi?.textContent || '');
  const [latitude, setLatitude] = useState(poi?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(poi?.longitude?.toString() || '');
  
  const [appThumbnail, setAppThumbnail] = useState(poi?.appThumbnail || '');
  const [header16x9, setHeader16x9] = useState(poi?.header16x9 || '');
  const [audioUrl, setAudioUrl] = useState(poi?.audioUrl || '');
  
  const [carouselImages, setCarouselImages] = useState<string[]>(poi?.carouselImages || []);
  const [newCarouselUrl, setNewCarouselUrl] = useState('');

  // File states for images/audio
  const [appThumbnailFile, setAppThumbnailFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // 3-slot video state
  const initVideoSlots = (): VideoSlot[] => {
    const existingUrls: string[] = poi?.videoUrls || (poi?.videoUrl ? [poi.videoUrl] : []);
    const slots: VideoSlot[] = existingUrls.slice(0, MAX_VIDEO_SLOTS).map((url: string) => ({
      url,
      file: null,
      mode: 'url' as const,
    }));
    return slots;
  };
  const [videoSlots, setVideoSlots] = useState<VideoSlot[]>(initVideoSlots);

  const handleAddVideoSlot = () => {
    if (videoSlots.length < MAX_VIDEO_SLOTS) {
      setVideoSlots([...videoSlots, { url: '', file: null, mode: 'url' }]);
    }
  };

  const handleRemoveVideoSlot = (index: number) => {
    setVideoSlots(videoSlots.filter((_, i) => i !== index));
  };

  const updateVideoSlot = (index: number, updates: Partial<VideoSlot>) => {
    setVideoSlots(videoSlots.map((slot, i) => i === index ? { ...slot, ...updates } : slot));
  };

  const handleVideoFileChange = (index: number, file: File | null) => {
    if (file && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      alert(`El fitxer "${file.name}" supera el límit de ${MAX_VIDEO_SIZE_MB}MB.`);
      return;
    }
    updateVideoSlot(index, { file, url: file ? file.name : '' });
  };

  const handleAddCarouselImage = () => {
    if (newCarouselUrl && carouselImages.length < 4) {
      setCarouselImages([...carouselImages, newCarouselUrl]);
      setNewCarouselUrl('');
    }
  };

  const handleRemoveCarouselImage = (index: number) => {
    setCarouselImages(carouselImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeId) {
      alert('Has d\'assignar el punt a una ruta. Selecciona una carpeta abans de guardar.');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('text_content', textContent);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (routeId) formData.append('route_id', routeId);
    
    if (appThumbnailFile) formData.append('app_thumbnail_file', appThumbnailFile);
    if (headerFile) formData.append('header_file', headerFile);
    if (audioFile) formData.append('audio_file', audioFile);
    
    formData.append('app_thumbnail', appThumbnail);
    formData.append('header_16x9', header16x9);
    formData.append('audio_url', audioUrl);

    // Serialize video slots — files and/or URLs
    const videoUrls: string[] = [];
    videoSlots.forEach((slot, idx) => {
      if (slot.file) {
        formData.append(`video_file_${idx}`, slot.file);
      }
      if (slot.url) {
        videoUrls.push(slot.url);
      }
    });
    formData.append('video_urls', JSON.stringify(videoUrls));
    formData.append('video_slot_count', videoSlots.length.toString());
    formData.append('carousel_images', JSON.stringify(carouselImages));

    // Verify total size before sending to prevent server rejection/timeout
    let totalSize = 0;
    const filesToUpload = [appThumbnailFile, headerFile, audioFile, ...videoSlots.map(s => s.file)];
    filesToUpload.forEach(f => { if (f) totalSize += f.size; });
    
    // Limits: next.config.js bodySizeLimit is 100mb. We cap at 95mb for safety.
    if (totalSize > 95 * 1024 * 1024) {
      alert(`La mida total dels fitxers (${(totalSize / 1024 / 1024).toFixed(1)}MB) és massa gran. El límit és de 95MB per evitar errors de connexió.`);
      return;
    }

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="poiTitle" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400" />
              Títol del Punt
            </Label>
            <Input id="poiTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Església de Sant Joan" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="routeId" className="flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-stone-400" />
              Assignar a Carpeta (Ruta) <span className="text-red-500">*</span>
            </Label>
            <select 
              id="routeId" 
              value={routeId} 
              onChange={(e) => setRouteId(e.target.value)}
              required
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                !routeId ? 'border-red-300 bg-red-50/30' : 'border-input'
              }`}
            >
              <option value="" disabled>— Selecciona una ruta obligatòriament —</option>
              {routes.map((r: any) => (
                <option key={r.id} value={r.id}>{r.title || r.name}</option>
              ))}
            </select>
            {!routeId && (
              <p className="text-[10px] text-red-500 flex items-center gap-1">
                ⚠️ Camp obligatori — el punt ha d&apos;anar associat a una ruta
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Descripció Breu (Pàgina principal)</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="textContent" className="flex items-center gap-2">
              <History className="w-4 h-4 text-stone-400" />
              Text Històric (Història llarga)
            </Label>
            <Textarea id="textContent" value={textContent} onChange={(e) => setTextContent(e.target.value)} className="min-h-[150px]" placeholder="Escriu aquí la història detallada del punt..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lat">Latitud</Label>
              <Input id="lat" type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lng">Longitud</Label>
              <Input id="lng" type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Multimedia */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="appThumb" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-stone-400" />
                Foto Llistat App
              </div>
              <div className="flex gap-1">
                <button type="button" className="text-[9px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold ring-2 ring-amber-100 shadow-sm transition-all">1:1</button>
              </div>
            </Label>
            <div className="relative group space-y-2">
              <Input type="file" accept="image/*" onChange={(e) => setAppThumbnailFile(e.target.files?.[0] || null)} className="cursor-pointer" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400">O URL:</span>
                <Input id="appThumb" value={appThumbnail} onChange={(e) => setAppThumbnail(e.target.value)} placeholder="URL imatge" className="h-8 text-xs" />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="headerImg" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-stone-400" />
                Foto Header
              </div>
              <div className="flex gap-1">
                <button type="button" className="text-[9px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold ring-2 ring-blue-100 shadow-sm transition-all">16:9</button>
              </div>
            </Label>
            <div className="relative group space-y-2">
              <Input type="file" accept="image/*" onChange={(e) => setHeaderFile(e.target.files?.[0] || null)} className="cursor-pointer" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400">O URL:</span>
                <Input id="headerImg" value={header16x9} onChange={(e) => setHeader16x9(e.target.value)} placeholder="URL imatge" className="h-8 text-xs" />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audio" className="flex items-center gap-2">
              <Music className="w-4 h-4 text-stone-400" />
              Àudio Guia
            </Label>
            <div className="space-y-2">
              <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="cursor-pointer" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400">O URL:</span>
                <Input id="audio" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="URL de l'arxiu .mp3" className="h-8 text-xs" />
              </div>
            </div>
          </div>

          {/* 3-Slot Video Section */}
          <div className="grid gap-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Film className="w-4 h-4 text-stone-400" />
                Vídeos Reel
                <span className="text-[10px] font-normal text-stone-400">({videoSlots.length}/{MAX_VIDEO_SLOTS})</span>
              </Label>
              {videoSlots.length < MAX_VIDEO_SLOTS && (
                <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleAddVideoSlot}>
                  <Plus className="w-3 h-3" />
                  Afegir Slot
                </Button>
              )}
            </div>

            {videoSlots.length === 0 && (
              <button
                type="button"
                onClick={handleAddVideoSlot}
                className="w-full py-8 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-stone-400 hover:text-stone-500 transition-colors"
              >
                <Film className="w-8 h-8" />
                <span className="text-xs font-medium">Afegir el primer vídeo</span>
              </button>
            )}

            <div className="space-y-3">
              {videoSlots.map((slot, idx) => (
                <div key={idx} className="relative p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 group">
                  {/* Slot Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Vídeo {idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant={slot.mode === 'url' ? 'default' : 'outline'}
                        size="sm"
                        className="h-5 text-[9px] px-2"
                        onClick={() => updateVideoSlot(idx, { mode: 'url', file: null })}
                      >
                        <Link2 className="w-2.5 h-2.5 mr-0.5" />
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={slot.mode === 'file' ? 'default' : 'outline'}
                        size="sm"
                        className="h-5 text-[9px] px-2"
                        onClick={() => updateVideoSlot(idx, { mode: 'file', url: '' })}
                      >
                        <Upload className="w-2.5 h-2.5 mr-0.5" />
                        ARXIU
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideoSlot(idx)}
                        className="ml-1 p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* URL Mode */}
                  {slot.mode === 'url' && (
                    <Input
                      value={slot.url}
                      onChange={(e) => updateVideoSlot(idx, { url: e.target.value })}
                      placeholder="URL del vídeo (.mp4, .m3u8 o .webm)"
                      className="h-9 text-xs"
                    />
                  )}

                  {/* File Mode */}
                  {slot.mode === 'file' && (
                    <div className="space-y-1">
                      <Input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                        onChange={(e) => handleVideoFileChange(idx, e.target.files?.[0] || null)}
                        className="cursor-pointer text-xs h-9"
                      />
                      {slot.file && (
                        <div className="flex items-center gap-2 text-[10px] text-emerald-600">
                          <Film className="w-3 h-3" />
                          <span className="truncate">{slot.file.name}</span>
                          <span className="text-stone-400">({(slot.file.size / 1024 / 1024).toFixed(1)}MB)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status indicator */}
                  {slot.url && slot.mode === 'url' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                      <Link2 className="w-3 h-3" />
                      <span className="truncate max-w-[250px]">{slot.url}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty slot placeholders */}
            {videoSlots.length > 0 && videoSlots.length < MAX_VIDEO_SLOTS && (
              <div className="flex gap-2">
                {Array.from({ length: MAX_VIDEO_SLOTS - videoSlots.length }).map((_, i) => (
                  <button
                    key={`empty-video-${i}`}
                    type="button"
                    onClick={handleAddVideoSlot}
                    className="flex-1 py-3 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-300 hover:border-stone-400 hover:text-stone-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] text-stone-400 italic">
              Màxim {MAX_VIDEO_SLOTS} vídeos · Menys de {MAX_VIDEO_SIZE_MB}MB cadascun · Formats: .mp4, .webm, .mov
            </p>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="space-y-4 pt-4 border-t border-stone-100">
        <Label>Carrusel d&apos;Imatges (Màxim 4)</Label>
        <div className="flex gap-2">
          <Input 
            value={newCarouselUrl} 
            onChange={(e) => setNewCarouselUrl(e.target.value)} 
            placeholder="URL imatge carrusel" 
            disabled={carouselImages.length >= 4}
          />
          <Button type="button" onClick={handleAddCarouselImage} disabled={!newCarouselUrl || carouselImages.length >= 4} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {carouselImages.map((url, idx) => (
            <div key={idx} className="relative aspect-square bg-stone-100 rounded-md overflow-hidden group">
              <img src={url} alt={`Carousel ${idx}`} className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => handleRemoveCarouselImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: 4 - carouselImages.length }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border-2 border-dashed border-stone-200 rounded-md flex items-center justify-center text-stone-300">
              <ImageIcon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 text-white">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardant...
            </>
          ) : (
            poi ? 'Actualitzar Punt' : 'Crear Nou Punt'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel·lar</Button>
      </div>
    </form>
  );
}

