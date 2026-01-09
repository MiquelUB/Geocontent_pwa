# ✅ Plan de Acción - Checklist de Auditoría

Este documento contiene una lista de tareas priorizadas basadas en la auditoría completa del repositorio.

---

## 🔴 CRÍTICO - Acción Inmediata (Esta Semana)

### Seguridad

- [ ] **Actualizar Next.js a versión segura**
  ```bash
  npm audit fix
  npm install next@latest
  ```
  - Archivos afectados: `package.json`
  - Tiempo estimado: 30 minutos
  - Responsable: DevOps/Backend
  - Impacto: CRÍTICO - Previene múltiples vulnerabilidades

- [ ] **Habilitar middleware de autenticación**
  - Archivo: `middleware.ts`
  - Descomentar código de autenticación
  - Probar flujos de login/logout
  - Verificar protección de rutas admin
  - Tiempo estimado: 2 horas
  - Responsable: Backend/Security
  - Impacto: CRÍTICO - Previene acceso no autorizado

- [ ] **Migrar completamente a @supabase/ssr**
  - Remover `@supabase/auth-helpers-nextjs`
  - Actualizar imports en todos los archivos
  - Archivos afectados: `lib/supabase/`, componentes con auth
  - Tiempo estimado: 3 horas
  - Responsable: Backend
  - Impacto: ALTO - Package deprecado

### Corrección de Errores

- [ ] **Corregir errores TypeScript (8 errores)**
  - [ ] `app/admin/page.tsx` - Exportar `getAllProfiles` desde `lib/actions.ts`
  - [ ] `components/ui/DashboardButton.tsx` - Agregar propiedades faltantes a tipo
  - Tiempo estimado: 4 horas
  - Responsable: Frontend
  - Impacto: ALTO - Previene errores en runtime

- [ ] **Corregir errores ESLint críticos (23 errores)**
  - [ ] Eliminar uso de tipo `any` (15 casos)
  - [ ] Corregir acceso a variables antes de declaración (4 casos)
  - [ ] Escapar caracteres en JSX (7 casos)
  - [ ] Corregir creación de componentes en render (1 caso)
  - [ ] Corregir interfaz vacía (1 caso)
  - Tiempo estimado: 8 horas
  - Responsable: Frontend
  - Impacto: ALTO - Mejora calidad y previene bugs

---

## 🟡 ALTA PRIORIDAD - Próximas 2 Semanas

### Optimización

- [ ] **Reemplazar tags `<img>` con `next/image` (10 ocurrencias)**
  - [ ] `app/login/page.tsx` (2 casos)
  - [ ] `components/figma/ImageWithFallback.tsx` (2 casos)
  - [ ] `components/fullscreen/ContentModal.tsx` (1 caso)
  - [ ] `components/screens/PallarsMapScreen.tsx` (1 caso)
  - [ ] `components/screens/ProfileScreen.tsx` (1 caso)
  - [ ] Otros componentes (3 casos)
  - Tiempo estimado: 3 horas
  - Responsable: Frontend
  - Impacto: MEDIO - Mejora performance y SEO

- [ ] **Corregir React Hooks warnings (5 casos)**
  - [ ] `components/GeofenceNotification.tsx` - Agregar `handleClose` a deps
  - [ ] `components/cards/ArticleCard.tsx` - Agregar `loadContents` a deps
  - [ ] `components/cards/LegendCard.tsx` - Agregar `loadLocations` a deps
  - [ ] `components/screens/PallarsMapScreen.tsx` - Mover función fuera de render
  - Tiempo estimado: 2 horas
  - Responsable: Frontend
  - Impacto: MEDIO - Previene bugs sutiles

### Testing

- [ ] **Configurar framework de testing**
  - [ ] Instalar Jest + React Testing Library
  - [ ] Configurar `jest.config.js`
  - [ ] Crear archivo de setup `setupTests.ts`
  - [ ] Agregar scripts de test a `package.json`
  - Tiempo estimado: 3 horas
  - Responsable: QA/Frontend Lead
  - Impacto: ALTO - Habilita testing

- [ ] **Implementar tests básicos (objetivo: 20% coverage)**
  - [ ] Tests para componentes UI críticos (5 tests)
  - [ ] Tests para utils y helpers (5 tests)
  - [ ] Tests para hooks personalizados (3 tests)
  - [ ] Tests para acciones de servidor (5 tests)
  - Tiempo estimado: 16 horas
  - Responsable: QA/Developers
  - Impacto: ALTO - Previene regresiones

### CI/CD

- [ ] **Configurar GitHub Actions**
  - [ ] Crear `.github/workflows/ci.yml`
  - [ ] Pipeline de lint en PRs
  - [ ] Pipeline de tests
  - [ ] Pipeline de build verification
  - [ ] Pipeline de security scan
  - Tiempo estimado: 4 horas
  - Responsable: DevOps
  - Impacto: ALTO - Automatiza QA

- [ ] **Configurar branch protection**
  - [ ] Require PR reviews (min 1)
  - [ ] Require status checks (lint, test, build)
  - [ ] No direct pushes to main
  - Tiempo estimado: 30 minutos
  - Responsable: Tech Lead/DevOps
  - Impacto: MEDIO - Mejora calidad de código

### Base de Datos

- [ ] **Organizar migraciones SQL**
  - [ ] Crear directorio `supabase/migrations/`
  - [ ] Renombrar archivos con formato versionado
  - [ ] Documentar orden de ejecución
  - [ ] Crear rollback scripts
  - Tiempo estimado: 4 horas
  - Responsable: Backend/DBA
  - Impacto: MEDIO - Mejora mantenibilidad

---

## 🟢 MEDIA PRIORIDAD - Próximo Mes

### Calidad de Código

- [ ] **Limpiar warnings de ESLint (60+ warnings)**
  - [ ] Remover imports no usados (30 casos)
  - [ ] Remover variables no usadas (20 casos)
  - [ ] Otros warnings (10 casos)
  - Tiempo estimado: 6 horas
  - Responsable: Frontend team
  - Impacto: BAJO-MEDIO - Limpieza de código

- [ ] **Agregar tipos explícitos**
  - [ ] Crear interfaces para props de componentes
  - [ ] Tipar funciones sin tipos explícitos
  - [ ] Documentar tipos complejos
  - Tiempo estimado: 8 horas
  - Responsable: Frontend team
  - Impacto: MEDIO - Mejora type safety

### Documentación

- [ ] **Crear directorio de documentación**
  - [ ] `docs/implementation_plan.md`
  - [ ] `docs/setup_guide.md`
  - [ ] `docs/vscode_extensions.md`
  - [ ] `docs/architecture.md`
  - [ ] `docs/testing_guide.md`
  - Tiempo estimado: 8 horas
  - Responsable: Tech Lead
  - Impacto: MEDIO - Facilita onboarding

- [ ] **Agregar JSDoc comments**
  - [ ] Documentar funciones complejas
  - [ ] Documentar interfaces y tipos
  - [ ] Documentar componentes principales
  - Tiempo estimado: 12 horas
  - Responsable: Developers
  - Impacto: BAJO - Mejora mantenibilidad

### Seguridad

- [ ] **Implementar CSP completo**
  - [ ] Agregar Content-Security-Policy header
  - [ ] Configurar en `next.config.js`
  - [ ] Probar con todas las fuentes externas
  - Tiempo estimado: 3 horas
  - Responsable: Security/Backend
  - Impacto: MEDIO - Previene XSS

- [ ] **Implementar HSTS**
  - [ ] Agregar Strict-Transport-Security header
  - [ ] Configurar en `vercel.json`
  - Tiempo estimado: 30 minutos
  - Responsable: DevOps
  - Impacto: BAJO - Seguridad adicional

- [ ] **Implementar Permissions-Policy**
  - [ ] Definir políticas de features
  - [ ] Agregar header
  - Tiempo estimado: 1 hora
  - Responsable: Security
  - Impacto: BAJO - Hardening adicional

### Performance

- [ ] **Análisis de bundle size**
  - [ ] Instalar `@next/bundle-analyzer`
  - [ ] Analizar chunks grandes
  - [ ] Optimizar imports
  - Tiempo estimado: 4 horas
  - Responsable: Frontend Lead
  - Impacto: MEDIO - Mejora load times

- [ ] **Implementar code splitting**
  - [ ] Identificar componentes grandes
  - [ ] Aplicar dynamic imports
  - [ ] Medir impacto
  - Tiempo estimado: 6 horas
  - Responsable: Frontend
  - Impacto: MEDIO - Mejora initial load

- [ ] **Lighthouse audit y optimización**
  - [ ] Correr Lighthouse en todas las páginas
  - [ ] Corregir issues encontrados
  - [ ] Objetivo: Score 90+ en todas las métricas
  - Tiempo estimado: 8 horas
  - Responsable: Frontend team
  - Impacto: MEDIO - Mejora UX

### Testing

- [ ] **Aumentar cobertura de tests (objetivo: 60%)**
  - [ ] Tests adicionales para componentes (20 tests)
  - [ ] Tests de integración (10 tests)
  - [ ] Tests E2E básicos (5 tests)
  - Tiempo estimado: 24 horas
  - Responsable: QA/Developers
  - Impacto: ALTO - Calidad de software

---

## 🔵 BAJA PRIORIDAD - Backlog

### Limpieza

- [ ] **Limpiar console.log statements**
  - [ ] Remover o reemplazar con proper logging
  - [ ] Configurar logger apropiado (winston/pino)
  - Tiempo estimado: 4 horas
  - Responsable: Developers
  - Impacto: BAJO - Limpieza

- [ ] **Resolver TODOs en código**
  - [ ] `components/layout/Header.tsx` - Navegación a perfil
  - Tiempo estimado: 2 horas
  - Responsable: Frontend
  - Impacto: BAJO

### Actualizaciones

- [ ] **Actualizar next-pwa**
  - [ ] Investigar alternativas modernas
  - [ ] Migrar si es necesario
  - Tiempo estimado: 6 horas
  - Responsable: Frontend Lead
  - Impacto: BAJO - Maintenance

- [ ] **Actualizar dependencias menores**
  - [ ] Review de todas las deps
  - [ ] Actualizar a últimas versiones estables
  - [ ] Testing completo
  - Tiempo estimado: 8 horas
  - Responsable: DevOps
  - Impacto: BAJO - Mantenimiento

### Monitoreo

- [ ] **Implementar error monitoring**
  - [ ] Configurar Sentry o similar
  - [ ] Agregar error boundaries
  - [ ] Setup alerting
  - Tiempo estimado: 4 horas
  - Responsable: DevOps
  - Impacto: MEDIO - Observability

- [ ] **Implementar analytics**
  - [ ] Configurar GA4 o Plausible
  - [ ] Tracking de eventos principales
  - [ ] Dashboard de métricas
  - Tiempo estimado: 6 horas
  - Responsable: Product/DevOps
  - Impacto: BAJO-MEDIO - Insights

- [ ] **Implementar performance monitoring**
  - [ ] Configurar Web Vitals tracking
  - [ ] Setup dashboard
  - [ ] Alerting para degradación
  - Tiempo estimado: 4 horas
  - Responsable: DevOps/Frontend
  - Impacto: MEDIO - Observability

---

## 📊 Resumen de Esfuerzo

| Prioridad | Tareas | Horas Estimadas |
|-----------|--------|-----------------|
| 🔴 Crítico | 8 | 20 horas |
| 🟡 Alta | 12 | 40 horas |
| 🟢 Media | 15 | 60 horas |
| 🔵 Baja | 8 | 40 horas |
| **TOTAL** | **43** | **160 horas** |

**Tiempo hasta production-ready:** 3-4 semanas con equipo de 2-3 developers

---

## 🎯 Milestones

### Milestone 1: Security & Stability (Semana 1)
- ✅ Todas las tareas CRÍTICAS completadas
- ✅ Zero vulnerabilidades críticas
- ✅ Zero errores de TypeScript
- ✅ Zero errores de ESLint

### Milestone 2: Quality & Testing (Semana 2)
- ✅ Framework de testing implementado
- ✅ CI/CD funcionando
- ✅ 20% cobertura de tests
- ✅ Todas las tareas de ALTA prioridad completadas

### Milestone 3: Optimization (Semana 3)
- ✅ Performance optimizada
- ✅ 60% cobertura de tests
- ✅ Documentación completa
- ✅ Mayoría de tareas MEDIA prioridad completadas

### Milestone 4: Production Ready (Semana 4)
- ✅ Lighthouse score 90+
- ✅ Security audit passed
- ✅ Load testing passed
- ✅ Ready for deployment

---

## 📝 Notas

- Revisar y actualizar este checklist semanalmente
- Priorizar basado en feedback del equipo
- Ajustar estimaciones según sea necesario
- Celebrar cada milestone completado 🎉

---

**Última actualización:** 9 de enero de 2026  
**Versión:** 1.0
