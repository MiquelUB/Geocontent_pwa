'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  visitedCount?: number
  unvisitedCount?: number
  nearbyCount?: number
  onNavigateToProfile?: () => void
}

export default function Header({ visitedCount = 0, unvisitedCount = 0, nearbyCount = 0, onNavigateToProfile }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleProfileClick = () => {
    // Navigate to profile screen if handler provided, otherwise do nothing
    if (onNavigateToProfile) {
      onNavigateToProfile()
    }
  }

  return (
    <header 
      className="relative w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/header_sin_iconos.png)',
        height: 'auto',
        aspectRatio: '375 / 100',
        minHeight: '100px',
        maxHeight: '180px'
      }}
    >
      {/* Transparent avatar button positioned over the left avatar figure */}
      <button
        onClick={handleProfileClick}
        className="absolute bg-transparent hover:bg-white/10 transition-all duration-300 rounded-full"
        style={{
          left: '15px',
          top: '55%',
          transform: 'translateY(-50%)',
          width: '45px',
          height: '45px',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}
        title="Perfil"
        aria-label="Ver perfil"
      >
        <span className="sr-only">Perfil</span>
      </button>

      {/* Transparent logout button positioned over the right door ornament */}
      <button
        onClick={handleLogout}
        className="absolute bg-transparent hover:bg-white/10 transition-all duration-300 rounded-lg"
        style={{
          right: '15px',
          top: '55%',
          transform: 'translateY(-50%)',
          width: '45px',
          height: '45px',
          // Visual debugging border (remove after positioning is confirmed)
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}
        title="Salir"
        aria-label="Cerrar sesión"
      >
        {/* Optional: Add a subtle icon or leave completely transparent */}
        <span className="sr-only">Salir</span>
      </button>
    </header>
  )
}
