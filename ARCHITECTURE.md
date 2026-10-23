# ARCHITECTURE — mi-botiquin

## Stack y justificación

- **React + Vite**: UI por componentes y servidor de desarrollo/build estático rápido; el producto no requiere servidor de aplicación.
- **JavaScript (React + Vite)**: se mantiene el stack confirmado por el usuario; usar módulos ES y JSDoc puntual si un contrato necesita aclaración, sin incorporar TypeScript.
- **Tailwind CSS**: composición mobile-first, con tokens del design system centralizados y clases reutilizables en componentes base.
- **Zustand**: estado de interfaz y coordinación de operaciones asíncronas; mantiene componentes desacoplados del detalle de IndexedDB.
- **Dexie.js + IndexedDB**: persistencia estructurada en el dispositivo, adecuada para búsquedas/listados locales y uso offline. No se usa `localStorage`.
- **Google Sheets publicado como CSV**: dos fuentes públicas de solo lectura, una de medicamentos y otra de insumos; se consumen con `fetch` nativo sin SDK ni credenciales.
- **vite-plugin-pwa**: integración del service worker, manifest y precache de la aplicación estática.
- **Vercel (deploy estático)**: sirve los archivos compilados; no se habilitan funciones serverless, APIs ni persistencia de servidor.

## Estructura de carpetas propuesta

```text
mi-botiquin/
├── public/
│   ├── icons/                 # Íconos PWA en tamaños requeridos
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.jsx            # Shell y composición de vistas
│   │   └── routes.jsx         # Rutas si se necesitan (MVP puede ser pantalla única)
│   ├── components/
│   │   ├── ui/                # Button, Input, Card, Badge, Dialog
│   │   └── layout/            # AppHeader, PageContainer
│   ├── features/
│   │   ├── inventory/
│   │   │   ├── inventory-csv.js
│   │   │   └── inventory-source.js
│   │   └── medicines/
│   │       ├── components/    # MedicineCard, MedicineList, SearchInput
│   │       ├── hooks/         # Hooks de feature, solo si simplifican consumidores
│   │       ├── medicine.schema.js
│   │       ├── medicine.types.js
│   │   │   ├── medicine.types.js
│   │   │   ├── medicine.schema.js
│   │   │   └── medicine.utils.js
│   ├── db/
│   │   ├── database.js        # Clase Dexie, tablas y versión de schema
│   │   └── medicines.repository.js # Lectura de datos legados durante migración
│   ├── stores/
│   │   └── inventory-store.js # Snapshots de Sheets, categorías y búsqueda
│   ├── styles/
│   │   ├── index.css          # Tailwind + CSS variables/tokens
│   │   └── tokens.css
│   ├── main.jsx
│   └── vite-env.d.js
├── index.html
├── vite.config.js
├── tailwind.config.js         # Solo si la versión de Tailwind elegida lo requiere
└── package.json
```

<!-- ASUNCIÓN: los nombres de archivos usan kebab-case salvo componentes React en PascalCase. -->

## Diagrama de componentes

```text
App
├── CategoryTabs (Medicamentos / Insumos)
├── SearchInput ──► filtro en memoria
├── MedicineList ──► MedicineCard (<details>/<summary>, solo lectura)
└── SupplyList (solo lectura)
         ▲
         │ Zustand inventoryStore
         │
Google Sheets CSV ─► inventorySource ─► parser/validación
                                      │
                                      ▼
                           Dexie.sourceSnapshots
```

## Flujo de datos

### Lectura, actualización y cache local
1. Al iniciar, `inventoryStore.loadInventory()` carga los últimos snapshots `medicines` y `supplies` desde Dexie para mostrar contenido inmediatamente/offline.
2. Si hay conexión y cada variable Vite está configurada, `inventorySource` descarga y valida la fuente CSV correspondiente. Solo un CSV completamente válido reemplaza su snapshot en Dexie.
3. Si la URL falta, hay error de red o el CSV no es válido, se muestra un aviso y se conserva el último snapshot exitoso.
4. La interfaz es de solo lectura; todas las altas/cambios/bajas se hacen directamente en Google Sheets.
5. Medicamentos e insumos tienen fuentes, listas y búsquedas independientes; la búsqueda compara sin distinguir mayúsculas o acentos. El CSV de medicamentos puede incluir `unidad`; si falta, el parser asigna `unidades` para mantener compatibilidad con la hoja previa.

### Búsqueda y orden
- Los catálogos cargados desde IndexedDB se filtran en el cliente en cada cambio de `query`; no requieren índice de búsqueda ni red.
- `normalizeSearchText()` debe normalizar Unicode (NFD), quitar marcas diacríticas y convertir a minúsculas. Se compara `includes()` contra `nombre` y `nombreGenerico` (si existe).
- Medicamentos se ordenan por nombre ascendente con comparación en locale `es-MX`; búsqueda vacía vuelve a mostrar el catálogo completo.
- Vencimientos se clasifican con fechas de calendario `YYYY-MM-DD` comparadas en fecha local. Nunca se convierten a timestamp UTC para determinar el día de vencimiento.

## Decisiones de diseño

- **Dexie y no `localStorage`**: IndexedDB soporta datos estructurados y mayor volumen, operaciones asíncronas e índices/migraciones; `localStorage` es síncrono, orientado a cadenas y está expresamente prohibido.
- **Zustand**: concentra estado compartido y transiciones async de inventario sin pasar props por toda la UI. Google Sheets es la fuente editable de verdad; Dexie conserva solo la última copia local válida y Zustand proyecta el estado para la UI.
- **Catálogos solo lectura**: sin autenticación ni mutaciones en la app; la hoja central se edita en Google Sheets y las CSV publicadas se consumen como vistas de lectura.
- **Fechas de vencimiento como fecha civil**: modelar vencimiento como `YYYY-MM-DD` evita que la zona horaria adelante o atrase el día mostrado.
- **Design system**: `src/styles/tokens.css` centraliza Burgundy Red `#721010`, Steel Blue `#8DA1B9`, Pebble Grey `#BCBDB8`, Sky Blue `#B7CCE3` y Mist Green `#E0E4DE`. El hero ocupa 100% de ancho en crema plano `#FDF8F0`, con título Chubby Rounded Burgundy Red completo, centrado horizontal y verticalmente, escrito intencionalmente «botiquin» sin tilde por limitación del glifo y al 80% de la escala previa. El resto del fondo usa bandas sólidas de 40 px Sky Blue y 20 px Burgundy Red (la roja mide la mitad); el inventario se presenta en tarjeta centrada crema `#FDF8F0` con radio suave y sombra sutil. La búsqueda se alinea a la izquierda con separación inferior. Las cards usan `<details>/<summary>`: el resumen muestra nombre comercial/genérico, dosis y cantidad+unidad (ej. `2 cajas`), y al expandir forma, vencimiento, notas y sin controles de edición. Fuentes locales: Chubby Rounded para marca/wordmark (nota del autor limita a uso personal; comercial requiere contactar a imagex-fonts), Caveat para «explorar». El nav tiene marca a la izquierda y un enlace de consulta pública. Los badges de vencimiento conservan namespace aparte: Olive/Oat para verde, Butter/Cherry para amarillo y Cherry/Butter para rojo; conservar etiquetas y fechas.

## Estrategia PWA y offline

- `vite-plugin-pwa` genera el service worker y manifest al compilar la app.
- **Precache**: HTML de entrada, bundles JS/CSS, fuentes locales si se agregan, íconos y assets estáticos versionados de la app; esto habilita cargar la interfaz luego de una primera visita online.
- **Datos**: Dexie/IndexedDB almacena el último snapshot válido de medicamentos e insumos; service worker no cachea respuestas CSV ni datos del inventario.
- **Runtime**: online, la aplicación consulta las URLs CSV publicadas de Google Sheets. Offline, usa los snapshots locales; los cambios se editan en Sheets, nunca desde la PWA.
- **Actualizaciones**: usar política de actualización controlada y comunicar cuando haya una nueva versión disponible; no forzar cierre que pueda interrumpir edición.
- **Instalación**: manifest con `name`, `short_name`, `start_url`, `scope`, `display: standalone`, `theme_color`, `background_color` e íconos adecuados. Verificar instalabilidad en navegador compatible.
- **Límite del offline**: un service worker no puede garantizar la primera carga si nunca se abrió con conexión y no hay snapshot Dexie; la app debe indicar ese requisito, sin prometer sincronización bidireccional.

## Preguntas para el usuario

1. Los endpoints CSV están configurados localmente en `.env.local` y como plantilla en `.env.example`, usando las pestañas existentes.
2. La hoja actualmente indica «Público en la Web», por lo que quien tenga el enlace puede ver los datos publicados; no cargar información privada.
3. Falta configurar ambas variables en Vercel y validar headers/fechas y refresco remoto del deploy.
