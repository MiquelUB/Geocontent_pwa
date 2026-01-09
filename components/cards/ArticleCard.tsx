'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from './Card'
import { Music, Image as ImageIcon, Video, FileText, Maximize2 } from 'lucide-react'

interface Content {
  id: string
  title: string
  content_type: string
  content_url: string | null
  content_text: string | null
  location_id: string
}

interface ArticleCardProps {
  locationId: string
  onExpand: (content: Content) => void
}

export default function ArticleCard({ locationId, onExpand }: ArticleCardProps) {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadContents = useCallback(async () => {
    const { data } = await supabase
      .from('content')
      .select('*')
      .eq('location_id', locationId)
      .order('order_index')

    if (data) {
      setContents(data)
    }
    setLoading(false)
  }, [locationId, supabase])

  useEffect(() => {
    loadContents()
  }, [loadContents])

  const getIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="w-6 h-6" />
      case 'video': return <Video className="w-6 h-6" />
      case 'image': return <ImageIcon className="w-6 h-6" />
      case 'text': return <FileText className="w-6 h-6" />
      default: return <FileText className="w-6 h-6" />
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </Card>
    )
  }

  return (
    <>
      {contents.map((content) => (
        <Card
          key={content.id}
          onClick={() => onExpand(content)}
          className="p-6 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              {getIcon(content.content_type)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{content.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{content.content_type}</p>
            </div>
            <Maximize2 className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      ))}
    </>
  )
}
