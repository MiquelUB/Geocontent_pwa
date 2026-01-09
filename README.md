# GeoContent PWA 🗺️

Progressive Web Application de geolocalización que entrega contenido multimedia
contextualizado basado en la ubicación del usuario mediante geofencing
inteligente.

## 🚀 Características

- 📍 **Geolocalización en tiempo real** con OpenStreetMap
- 🎯 **Geofencing inteligente** con Turf.js
- 🎵 **Contenido multimedia** (audio, video, imágenes, texto, PDF)
- 🎮 **Gamificación** con sistema de puntos y logros
- 💬 **Comentarios y ratings** de ubicaciones
- 🧩 **Mini-quizzes** interactivos
- 👤 **Perfiles de usuario** con estadísticas
- 🏆 **Leaderboard** global
- 📱 **PWA instalable** con funcionalidad offline
- 🔐 **Autenticación** con Supabase (Google + Email)

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + PostGIS)
- **Autenticación:** Supabase Auth
- **Almacenamiento:** Supabase Storage
- **Mapas:** Leaflet + OpenStreetMap
- **Geofencing:** Turf.js
- **Formularios:** React Hook Form + Zod
- **Iconos:** Lucide React
- **PWA:** next-pwa

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta en Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/geocontent-pwa.git
   cd geocontent-pwa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Configurar Supabase**

   Ver [setup_guide.md](./docs/setup_guide.md) para instrucciones detalladas.

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
geocontent-pwa/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (app)/             # Rutas de aplicación
│   ├── admin/             # Panel de administración
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── map/              # Componentes de mapa
│   ├── media/            # Reproductores multimedia
│   ├── quiz/             # Componentes de quiz
│   └── ui/               # Componentes UI base
├── lib/                   # Utilidades y servicios
│   ├── supabase/         # Clientes Supabase
│   ├── services/         # Servicios de negocio
│   └── hooks/            # React Hooks personalizados
├── public/               # Archivos estáticos
│   ├── icons/            # Iconos PWA
│   └── manifest.json     # PWA Manifest
└── next.config.js        # Configuración Next.js
```

## 🎮 Uso

### Para Usuarios

1. **Permitir geolocalización** cuando la app lo solicite
2. **Explorar el mapa** para ver geocercas disponibles
3. **Entrar en geocercas** para descubrir contenido multimedia
4. **Completar quizzes** para ganar puntos
5. **Dejar comentarios** y ratings en ubicaciones
6. **Ver tu perfil** en "Mi Cuenta" para ver estadísticas

### Para Administradores

1. **Acceder al panel admin** en `/admin`
2. **Crear geocercas** dibujando polígonos en el mapa
3. **Subir contenido multimedia** y asociarlo a geocercas
4. **Crear quizzes** para cada ubicación
5. **Gestionar usuarios** y contenido

## 🚀 Despliegue en Vercel

1. **Push a GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Configura las variables de entorno
   - Deploy automático

## 📚 Documentación

- [Plan de Implementación](./docs/implementation_plan.md)
- [Guía de Configuración](./docs/setup_guide.md)
- [Extensiones de VS Code](./docs/vscode_extensions.md)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ para crear experiencias de contenido basadas en ubicación.

---

## 🔍 Auditoría del Repositorio

Se ha realizado una **auditoría completa del repositorio** (9 de enero de 2025). Los resultados están disponibles en:

- 📄 **[AUDIT_INDEX.md](./AUDIT_INDEX.md)** - Índice y guía de navegación ⭐ **EMPEZAR AQUÍ**
- 📄 **[AUDIT_SUMMARY.md](./AUDIT_SUMMARY.md)** - Resumen ejecutivo (5 min)
- 📄 **[AUDIT_REPORT.md](./AUDIT_REPORT.md)** - Informe completo (30 min)
- 📄 **[ACTION_ITEMS.md](./ACTION_ITEMS.md)** - 43 tareas priorizadas

**Calificación:** ⭐⭐⭐☆☆ (3/5) | **Estado:** ⚠️ Requiere atención antes de producción

**Tiempo estimado hasta production-ready:** 3-4 semanas

---

**Estado del Proyecto:** ✅ Fase 1 Completada - Listo para desarrollo de base de
datos
