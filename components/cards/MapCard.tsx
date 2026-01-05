'use client'

import { useState } from 'react'
import Card from './Card'
import MapboxMap from '../map/MapboxMap'
import { Maximize2 } from 'lucide-react'

interface MapCardProps {
  userLocation: { latitude: number; longitude: number } | null
}

export default function MapCard({ userLocation }: MapCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <MapboxMap
          center={userLocation ? [userLocation.longitude, userLocation.latitude] : [1.5, 42.4]}
          zoom={13}
          className="h-full w-full"
          userLocation={userLocation}
        />
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <Card className="relative overflow-hidden h-96">
      <MapboxMap
        center={userLocation ? [userLocation.longitude, userLocation.latitude] : [1.5, 42.4]}
        zoom={13}
        className="h-full w-full"
        userLocation={userLocation}
      />
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute bottom-4 right-4 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        title="Expandir mapa"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </Card>
  )
}
