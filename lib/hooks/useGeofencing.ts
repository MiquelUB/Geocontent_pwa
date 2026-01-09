import { useState, useEffect, useCallback } from 'react'
import { geofencingService, Location, GeofenceEvent } from '@/lib/services/geofencing-service'
import { createClient } from '@/lib/supabase/client'

interface UseGeofencingReturn {
  activeGeofences: Location[]
  loading: boolean
  error: string | null
  checkPosition: (latitude: number, longitude: number) => void
}

export function useGeofencing(
  latitude: number | null,
  longitude: number | null
): UseGeofencingReturn {
  const [activeGeofences, setActiveGeofences] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Cargar geocercas desde Supabase
  useEffect(() => {
    async function loadGeofences() {
      try {
        setLoading(true)
        
        const { data, error: fetchError } = await supabase
          .from('locations')
          .select('*')
          .eq('active', true)

        if (fetchError) throw fetchError

        if (data) {
          // Convertir zone de PostGIS a formato compatible
          const locations: Location[] = data.map((loc: {
            id: string
            name: string
            description: string | null
            zone: string | { type: string; coordinates: number[][][] }
            active: boolean
            points_value: number
          }) => ({
            id: loc.id,
            name: loc.name,
            description: loc.description,
            zone: loc.zone, // PostGIS devuelve GeoJSON
            active: loc.active,
            points_value: loc.points_value,
          }))

          geofencingService.loadGeofences(locations)
        }

        setError(null)
      } catch (err) {
        console.error('Error loading geofences:', err)
        setError('Error al cargar las geocercas')
      } finally {
        setLoading(false)
      }
    }

    loadGeofences()
  }, [supabase])

  // Verificar posición cuando cambia la ubicación
  const checkPosition = useCallback((lat: number, lon: number) => {
    const active = geofencingService.checkPosition(lat, lon)
    setActiveGeofences(active)
  }, [])

  // Auto-verificar cuando cambia la ubicación del usuario
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      checkPosition(latitude, longitude)
    }
  }, [latitude, longitude, checkPosition])

  // Configurar callbacks para eventos de entrada/salida
  useEffect(() => {
    const handleEnter = (event: GeofenceEvent) => {
      // Geofence entered - notification could be shown here
    }

    const handleExit = (event: GeofenceEvent) => {
      // Geofence exited - cleanup could be done here
    }

    geofencingService.onEnter(handleEnter)
    geofencingService.onExit(handleExit)

    return () => {
      geofencingService.reset()
    }
  }, [])

  return {
    activeGeofences,
    loading,
    error,
    checkPosition,
  }
}
