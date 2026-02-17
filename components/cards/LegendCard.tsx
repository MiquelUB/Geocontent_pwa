'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/database/supabase/client'
import Card from './Card'
import { MapPin, CheckCircle, Circle, Navigation } from 'lucide-react'

interface Location {
  id: string
  name: string
  description: string
  active: boolean
}

export default function LegendCard() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, description, active')
      .eq('active', true)
      .order('name')

    if (data) {
      setLocations(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLocations()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        Ubicaciones
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <Circle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {location.name}
              </p>
              {location.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {location.description}
                </p>
              )}
            </div>
          </div>
        ))}
        {locations.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay ubicaciones disponibles
          </p>
        )}
      </div>
    </Card>
  )
}
