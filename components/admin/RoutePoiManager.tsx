'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Trash2, RefreshCw, Pencil } from 'lucide-react';
import { getRouteWithPois, addPoiToRoute, removePoiFromRoute } from '@/lib/actions';

interface Poi {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  appThumbnail?: string;
  header16x9?: string;
  audioUrl?: string;
  videoUrls?: string[];
  textContent?: string;
  carouselImages?: string[];
  orderIndex?: number;
}

interface RoutePoiManagerProps {
  routeId: string;
  routeName: string;
  onClose: () => void;
  onEditPoi?: (poi: Poi) => void;
}

export default function RoutePoiManager({ routeId, routeName, onClose, onEditPoi }: RoutePoiManagerProps) {
  const [pois, setPois] = useState<Poi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null); // poiId being processed

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const route = await getRouteWithPois(routeId);
      setPois(route?.pois ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRemovePoi(poiId: string) {
    if (!confirm('Treure aquest punt del recorregut?')) return;
    setIsSaving(poiId);
    const res = await removePoiFromRoute(routeId, poiId);
    if (res.success) {
      setPois(prev => prev.filter(p => p.id !== poiId));
    } else {
      alert('Error: ' + res.error);
    }
    setIsSaving(null);
  }

  async function handleAddOrphan(poiId: string) {
    setIsSaving(poiId);
    const nextOrder = pois.length;
    const res = await addPoiToRoute(routeId, poiId, nextOrder);
    if (res.success) {
      await fetchData();
    } else {
      alert('Error: ' + res.error);
    }
    setIsSaving(null);
  }


  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl shadow-inner p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Punts de la Ruta</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            <span className="font-medium text-terracotta-600">"{routeName}"</span>
            {' '}— {pois.length} punt{pois.length !== 1 ? 's' : ''} assignat{pois.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchData} title="Refrescar">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Tancar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Carregant punts...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Current POIs in this route */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Punts Actuals
            </h4>
            {pois.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-lg">
                <p className="text-sm text-stone-400">Cap punt assignat a aquesta ruta.</p>
                <p className="text-xs text-stone-400 mt-1">Afegeix-ne de nous o assigna'n d'existents.</p>
              </div>
            ) : (
              <ol className="space-y-2">
                {pois.map((poi, idx) => (
                  <li
                    key={poi.id}
                    className="flex items-center gap-3 bg-white border border-stone-200 rounded-lg p-3 shadow-sm"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-800 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{poi.title}</p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {poi.latitude?.toFixed(4) ?? '—'}, {poi.longitude?.toFixed(4) ?? '—'}
                      </p>
                    </div>
                    {(poi.latitude && poi.longitude) ? (
                      <Badge variant="outline" className="text-[9px] border-green-200 text-green-700 flex-shrink-0">
                        📍 GPS
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] border-red-200 text-red-600 flex-shrink-0">
                        ⚠️ Sense GPS
                      </Badge>
                    )}
                    {/* Edit button */}
                    {onEditPoi && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onEditPoi(poi);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={isSaving === poi.id}
                        className="text-stone-400 hover:text-terracotta-600 hover:bg-terracotta-50 flex-shrink-0 p-1.5 h-auto"
                        title="Editar punt"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePoi(poi.id)}
                      disabled={isSaving === poi.id}
                      className="text-stone-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 p-1.5 h-auto"
                      title="Treure del recorregut"
                    >
                      {isSaving === poi.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* RIGHT: Hint to use the editor above */}
          <div className="space-y-4">
            <div className="border border-stone-200 rounded-lg p-4 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Crear nou punt</h4>
              <p className="text-xs text-stone-400 italic">
                Utilitza l&apos;&quot;Editor de Punts&quot; de dalt per crear un nou punt.<br />
                Assegura&apos;t de seleccionar <strong className="text-stone-600">&quot;{routeName}&quot;</strong> al desplegable de ruta.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
