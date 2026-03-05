

# 📄 PRODUCT SPECIFICATION DOCUMENT (PSD)

**Producto:** Projecte Xino Xano (PXX) \- Core Platform**Versión:** 4.0 (Actualizada SaaS B2G 2026\)**Estado:** 🟢 APROBADO PARA DESPLIEGUE

## 1\. VISIÓN GENERAL DEL PRODUCTO

PXX es una plataforma Micro-SaaS B2G de "Marca Blanca" diseñada para la gestión territorial y el "Digital Scouting" 1, 2\. Su objetivo es descentralizar el turismo (concepto: "La Ciudad de los 15 minutos digitales") ofreciendo a los ayuntamientos **Soberanía Digital** absoluta sobre sus datos y mapas, eliminando el pago de licencias a terceros como Google Maps 3-5.

## 2\. ARQUITECTURA DEL SISTEMA ("The Brain & The Muscle")

La plataforma se divide en un núcleo de gestión síncrona y un sistema de procesamiento asíncrono pesado 6, 7\.

* **Frontend Móvil (App Camaleón):** Desarrollado en **Flutter v3.19+** con motor gráfico **Impeller** (60 FPS) 8, 9\. Utiliza maplibre\_gl para la renderización de mapas vectoriales propios 8, 9\. La lógica de estado se gestiona estrictamente con BLoC o Riverpod 8, 9\.  
* **Backend (PXX Studio & API REST):** Construido en **Next.js 14+** (App Router) y TypeScript 6, 10\. La base de datos es **PostgreSQL con la extensión espacial PostGIS** (vital para cálculos geodésicos como *Bounding Boxes*) 8, 10\. Toda validación de entrada pasa por **Zod** y se aplica seguridad a nivel de fila (**RLS**) 10, 11\. La autenticación es *Passwordless* mediante Magic Links (Auth.js v5) 6, 10\.  
* **Background Workers ("El Músculo"):** Tareas gestionadas mediante colas **BullMQ (Redis)** 8, 12\.  
* *Worker Multimedia:* Ejecuta **FFmpeg** para transcodificar vídeo a formato HLS y audio a AAC 8, 13\.  
* *Worker IA ("Punt d'Or"):* Conecta vía OpenRouter con modelos **DeepSeek-V3** (creatividad) y **Qwen-Turbo** (traducción/mecánica) para procesar PDFs municipales 14, 15\.  
* **Infraestructura de Alojamiento:** Servidores en Hetzner, almacenamiento estático en **Cloudflare R2** y AWS S3 (Infrequent Access) para evitar *egress fees*, y servidor propio de *Vector Tiles* 14, 16\.

## 3\. ESPECIFICACIONES FUNCIONALES CORE

### 3.1. Estrategia "Kilómetro Cero" (Offline-First)

El sistema garantiza descargas ultrarrápidas y funcionamiento sin internet mediante la técnica de *Slicing*:

* **Lógica de Recorte:** Se calcula el polígono del municipio y se añade un **Buffer de seguridad de 5 a 10 km** mediante PostGIS 17, 18\.  
* **Generación de Paquete:** Se genera un archivo .mbtiles estático usando la herramienta tile-join 19, 20\.  
* **Límite de Peso:** El mapa offline de todo el municipio debe pesar **entre 5 y 20 MB**, permitiendo descargas en menos de 5 segundos 17, 21\.

### 3.2. Límites de Contenido y "Fair Use" (SLA)

Para proteger el rendimiento offline y los costes de servidor (margen \>98%), se imponen los siguientes límites estrictos por cada Punto de Interés (POI) 14, 22:

* **Texto:** Máximo **2.500 caracteres** (\~400 palabras) para evitar *scroll* infinito en exteriores 22\.  
* **Imágenes:** Máximo **3 fotografías** (peso límite de **3MB por imagen**) para la galería y el *Time Slider* 22\.  
* **Audio:** Máximo **1 pista AAC** por POI, peso límite de **5MB** (\~3-4 minutos) 22\.  
* **Vídeo ("Snack & Dinner"):** El consistorio puede elegir entre **3 Reels cortos** (máximo 1m 20s cada uno) O **1 Vídeo documental** (máximo 3m 30s) 22, 23\. Los vídeos largos solo se reproducen vía *streaming* (HLS), mientras que los *snacks* pueden descargarse en el paquete offline 13\.

### 3.3. IA "Punt d'Or" (Productividad B2G)

El administrador municipal dispone de una interfaz de pantalla partida 24, 25\. Al subir un PDF institucional, la IA analiza el texto con un límite de **4.000 tokens por petición** y devuelve automáticamente: resumen de 400 palabras, guion de audio y *Quizzes* 15\.

### 3.4. Motor "Camaleón" (Marca Blanca)

La App adapta dinámicamente sus tipografías (Space Grotesk, Playfair, etc.) y paleta de colores inyectando un JSON según el bioma asignado 26-28:

* *Muntanya* (Verde \#2D4636) | *Mar* (Azul \#1A3A5A) | *Interior* (Terracota \#B24C39) | *Blossom* (Rosa \#D982B5) | *City/Patrimonio* (Negro/Modo Oscuro \#1A1A1A) 27, 29\.

## 4\. SISTEMA DE GAMIFICACIÓN (XP ENGINE)

Diseñado para incentivar la observación física sin fricción competitiva. Se ejecuta al 100% en *Server-Side* (lib/actions.ts) para evitar trampas 30\.

### 4.1. Reglas de Experiencia (XP) y Quizzes

* **\+100 XP:** Desbloqueo de POI por geolocalización in-situ estricta 30, 31\.  
* **\+50 XP:** Acertar el *Quiz de Observación* in-situ (al 1º o 2º intento). El Quiz es generado por la IA basándose solo en hechos históricos del texto 30, 32, 33\.  
* **\+500 XP:** Completar todos los POIs de una ruta (Progreso \= 1.0) 32, 34\.  
* **\+1.000 XP:** Vencer al "Final Boss" (Quiz final transversal de la ruta) 32, 34\.

### 4.2. Grados de Progresión

* Nivel 1 (0 \- 499 XP): *Explorador Novell* 34\.  
* Nivel 2 (500 \- 999 XP): *Rastrejador de Camins* 34\.  
* Nivel 3 (1.000 \- 1.499 XP): *Viatger del Territori* 34\.  
* Nivel 4 (1.500 \- 1.999 XP): *Naturalista Expert* 34\.  
* Nivel 5+ (\>2.000 XP): *Mestre del Pirineu* 34\.

### 4.3. Arte de Recompensa (Sellos vs. Iconos)

* **Iconos de Mapa:** Siluetas funcionales negras, planas y sin detalle interno (ej. búnker, busto) 35, 36\.  
* **Sellos de Pasaporte:** Al completar el Quiz de un POI o el repte final, se estampa un sello (estilo linóleo / grabado vintage a todo color) seleccionado aleatoriamente de un *pool* de 20 sellos estrictamente asignados a su Bioma (ej. un Isard en "Muntanya", un Far en "Mar") 29, 37, 38\.

## 5\. ESTRUCTURA DE PLANES SAAS B2G (TIERS)

El pago único está prohibido. Todos los clientes se suscriben a uno de los 3 planes modulares, asegurando un **margen bruto \>98%** (COGS medio \~37-97€/año) 14, 39, 40\.  
Plan,Capacidad,Límite MAU,Precio Setup,Mantenimiento (ARR),Features Específicas  
ROURE,5 Rutes (Max 10 POIs/ruta),5.000 / mes,3.500 €,2.500 € / año,"IA Básica (solo texto) 41, 42."  
MIRADOR,10 Rutes (Max 20 POIs/ruta),10.000 / mes,5.500 €,5.000 € / año,"Generación de Quizzes IA automática 41, 42."  
TERRITORI,20 Rutes (Max 35 POIs/ruta),20.000 / mes,9.500 €,14.000 € / año,"Multi-Bioma Activo (Cambios dinámicos en municipio) 41, 42."

* **Complementos de Expansión:** \+700€/año por ruta extra, \+750€/año por \+5.000 MAU extras, \+450€ Setup nueva ruta 23, 43\.  
* **Regla de Activación:** La PWA y el panel de control solo se liberan **tras el cobro efectivo** del *Setup Fee* en la cuenta bancaria de PXX 43, 44\.

## 6\. PROTOCOLO DE OFF-BOARDING Y SOBERANÍA

Para vencer las objeciones comerciales por miedo al "secuestro de datos", PXX garantiza un proceso de salida transparente 45, 46:

1. **Notificación y Periodo de Gracia:** Aviso de 30 días. Tras el fin del contrato, el ayuntamiento dispone de **15 días extra de cortesía** para extraer sus datos 45\.  
2. **Exportación (Botón "Exportar Relat"):** Entrega de un archivo estructurado (JSON/CSV) con POIs, coordenadas y textos, y un archivo comprimido (ZIP) con sus imágenes, audios y vídeos 47\.  
3. **Apagado del Motor (Día 16):** Se desactiva la URL, se cortan los accesos al PXX Studio, a los módulos (Slider, Pasaporte, IA) y se purgan los Mapas Vectoriales de nuestros servidores 48\.  
4. **Cumplimiento RGPD (Día 30):** Eliminación permanente e irrecuperable de las bases de datos de todos los registros de turistas/usuarios de ese municipio 46\.

