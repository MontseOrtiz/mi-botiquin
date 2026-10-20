# ARCHITECTURE — mi-botiquin

## Stack y justificación

- **React + Vite**: UI por componentes y servidor de desarrollo/build estático rápido; el producto no requiere servidor de aplicación.
- **JavaScript (React + Vite)**: se mantiene el stack confirmado por el usuario; usar módulos ES y JSDoc puntual si un contrato necesita aclaración, sin incorporar TypeScript.
- **Tailwind CSS**: composición mobile-first, con tokens del design system centralizados y clases reutilizables en componentes base.
- **Zustand**: estado de interfaz y coordinación de operaciones asíncronas; mantiene componentes desacoplados del detalle de IndexedDB.
- **Dexie.js + IndexedDB**: persistencia estructurada en el dispositivo, adecuada para búsquedas/listados locales y uso offline. No se usa `localStorage`.
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
│   │   └── medicines/
│   │       ├── components/    # MedicineCard, MedicineList, MedicineForm, SearchInput
│   │       ├── hooks/         # Hooks de feature, solo si simplifican consumidores
│   │       ├── medicine.schema.js
│   │       ├── medicine.types.js
│   │       ├── medicine.service.js
│   │       └── medicine.utils.js
│   ├── db/
│   │   ├── database.js        # Clase Dexie, tablas y versión de schema
│   │   └── medicines.repository.js
│   ├── stores/
│   │   └── medicine-store.js  # Estado de UI/datos observables y acciones async
│   ├── styles/
│   │   ├── index.css          # Tailwind + CSS variables/tokens
│   │   └── tokens.css
│   ├── main.jsx
│   └── vite-env.d.js
├── index.html
├── vite.config.js
├── tailwind.config.js         # Solo si la versión de Tailwind elegida lo requiere
├── 
└── package.json
```

<!-- ASUNCIÓN: los nombres de archivos usan kebab-case salvo componentes React en PascalCase. -->

## Diagrama de componentes

```text
App / MedicinePage
├── AppHeader
│   └── SearchInput ───────────────┐
├── MedicineList                   │ filtro en memoria
│   └── MedicineCard               │
│       ├── ExpiryBadge            │
│       ├── QuickDecrementButton   │
│       └── Edit/Delete actions    │
└── MedicineFormDialog             │
                                    ▼
                         Zustand medicineStore
                          │ acciones async y estado
                          ▼
                    medicineService
             validación/reglas de dominio simples
                          ▼
                medicinesRepository (Dexie)
                          ▼
                    IndexedDB local
```

## Flujo de datos

### Lectura y guardado
1. Al inicializar, `medicineStore.loadMedicines()` solicita los registros al repositorio Dexie.
2. El store mantiene `medicines`, `query`, `status` (idle/loading/saving/error) y un mensaje de error legible cuando corresponde.
3. Las acciones de crear, actualizar, decrementar y eliminar llaman al servicio/repositorio. La UI solo refleja el resultado exitoso después de confirmar persistencia; si falla, muestra error y conserva un estado coherente.
4. Dexie ejecuta cada mutación sobre la tabla `medicines`; timestamps se generan en el servicio, IDs en el cliente. No se duplica el inventario en otro mecanismo de persistencia.

### Búsqueda y orden
- La colección cargada desde IndexedDB se filtra en el cliente en cada cambio de `query`; no requiere índice de búsqueda ni red.
- `normalizeSearchText()` debe normalizar Unicode (NFD), quitar marcas diacríticas y convertir a minúsculas. Se compara `includes()` contra `nombre` y `nombreGenerico` (si existe).
- El orden por defecto es nombre ascendente con comparación en locale `es-MX`; búsqueda vacía vuelve a mostrar la colección completa.
- Vencimientos se clasifican con fechas de calendario `YYYY-MM-DD` comparadas en fecha local. Nunca se convierten a timestamp UTC para determinar el día de vencimiento.

## Decisiones de diseño

- **Dexie y no `localStorage`**: IndexedDB soporta datos estructurados y mayor volumen, operaciones asíncronas e índices/migraciones; `localStorage` es síncrono, orientado a cadenas y está expresamente prohibido.
- **Zustand**: concentra estado compartido y transiciones async de inventario sin pasar props por toda la UI. Dexie sigue siendo la fuente persistente de verdad; Zustand es una proyección en memoria, no una segunda base persistente.
- **Repositorio + servicio**: concentra Dexie detrás de una interfaz y evita acoplar formularios/cards al esquema físico. La validación de entrada y reglas como “no decrementar debajo de cero” viven en la frontera de servicio/dominio y se repiten como protección en las acciones.
- **Una pantalla principal**: el MVP puede ser SPA de una vista con diálogo/panel para alta y edición; incorporar router solo si aparecen flujos reales que lo justifiquen.
- **Fechas de vencimiento como fecha civil**: modelar vencimiento como `YYYY-MM-DD` evita que la zona horaria adelante o atrase el día mostrado.
- **Design system**: los tokens adjuntos son fuente de verdad. Usar blanco `#ffffff`, negro `#000000`, violet `#b154f9` para acciones/estados activos, grises definidos, peso 400, spacing de 4px, radios de 8px para controles/cards y sin sombras. La escala grande se reduce en mobile; el texto no baja de 16px. Badges semánticos verde/amarillo/rojo son excepción funcional acordada y no deben extenderse a otros elementos.

## Estrategia PWA y offline

- `vite-plugin-pwa` genera el service worker y manifest durante el build.
- **Precache**: HTML de entrada, bundles JS/CSS, fuentes locales si se agregan, íconos y assets estáticos versionados de la app; esto habilita cargar la interfaz luego de una primera visita online.
- **Datos**: inventario exclusivamente en IndexedDB, que permanece en el dispositivo/navegador; service worker no cachea ni sincroniza datos de medicamentos.
- **Runtime**: sin endpoints de API. Evitar estrategias de cache amplias para recursos remotos; el MVP no depende de recursos externos en tiempo de ejecución.
- **Actualizaciones**: usar política de actualización controlada y comunicar cuando haya una nueva versión disponible; no forzar cierre que pueda interrumpir edición.
- **Instalación**: manifest con `name`, `short_name`, `start_url`, `scope`, `display: standalone`, `theme_color`, `background_color` e íconos adecuados. Verificar instalabilidad en navegador compatible.
- **Límite del offline**: un service worker no puede garantizar la primera carga si nunca se abrió con conexión. La app debe describir este requisito con claridad; no prometer sincronización ni recuperación si el usuario borra datos del navegador.

## Preguntas para el usuario

1. Confirmado: solo React + Vite, sin TypeScript.
2. Confirmado: vencimiento obligatorio para todo medicamento.
3. Confirmado: alta/edición en diálogo o panel sobre la pantalla principal.
