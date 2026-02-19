'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/StatsCard";
import { Users, Clock, Map as MapIcon, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MapLibreMap from "@/components/map/MapLibreMap";

interface ExecutiveReportProps {
  municipalityId: string;
}

export default function ExecutiveReport({ municipalityId }: ExecutiveReportProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        if (!municipalityId) return;
        try {
            const res = await fetch(`/api/analytics/executive-report?municipalityId=${municipalityId}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (e) {
            console.error("Failed to load report", e);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [municipalityId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregant Informe Executiu...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Error carregant dades.</div>;

  const { metrics, topPois, aiInsights } = data;

  const getChangeBadge = (change: number) => {
      const isPositive = change >= 0;
      return (
        <span className={`text-xs ml-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center inline-flex`}>
           {isPositive ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
           {Math.abs(change)}% vs mes anterior
        </span>
      );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
            title="Usuaris Únics" 
            description={`${metrics.users.value} ${getChangeBadge(metrics.users.change)}`} 
            icon={<Users className="w-6 h-6 text-indigo-600" />}
        />
        <StatsCard 
            title="Temps per Ruta" 
            description={`${(metrics.avgTime.value / 60).toFixed(1)} min ${getChangeBadge(metrics.avgTime.change)}`} 
            icon={<Clock className="w-6 h-6 text-amber-600" />}
        />
         <StatsCard 
            title="Rutes Completades" 
            description={`${metrics.routesCompleted.value} ${getChangeBadge(metrics.routesCompleted.change)}`} 
            icon={<MapIcon className="w-6 h-6 text-emerald-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* 2. CHART: Top Retention POIs */}
          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Top Retenció per Punt d'Interès (Segons)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPois} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="avgDuration" radius={[0, 4, 4, 0]} barSize={32}>
                            {topPois.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={['#4f46e5', '#818cf8', '#c7d2fe'][index % 3]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. AI INSIGHTS */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                   🤖 Conclusions AI
                   <Badge className="bg-indigo-200 text-indigo-800 hover:bg-indigo-300">Beta</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-indigo-800 leading-relaxed italic">
                    "{aiInsights}"
                </p>
                <div className="mt-4 pt-4 border-t border-indigo-200/50 text-xs text-indigo-600">
                    Basat en l'anàlisi de {metrics.users.value} sessions aquest mes.
                </div>
            </CardContent>
          </Card>

          {/* 4. HEATMAP */}
          <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Mapa de Calor (Activitat Usuaris)</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-0 overflow-hidden rounded-b-xl relative">
                <MapLibreMap 
                    className="w-full h-full" 
                    heatmapData={data.heatmap || []}
                    center={[1.5209, 41.5912]} 
                    zoom={9}
                />
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    🔥 Zones calentes = Més tràfic
                </div>
            </CardContent>
          </Card>
      </div>

    </div>
  );
}
