# Mi botiquín

PWA personal para consultar desde el celular o la computadora los medicamentos e insumos del botiquín de casa. La interfaz es mobile-first, está en español (México) y puede abrirse sin conexión después de cargar los datos al menos una vez.

## Qué incluye

- Consulta de medicamentos con búsqueda por nombre comercial y genérico.
- Resumen de dosis y cantidad disponible con su unidad (por ejemplo, `2 cajas`); el detalle incluye forma, vencimiento y notas.
- Indicadores de vencimiento: vencido, próximo (hoy a 30 días) y vigente.
- Sección separada para insumos domésticos, como algodón, curitas o jeringas, con cantidad y unidad.
- Lectura de Google Sheets como fuente de datos. Para agregar, actualizar o quitar elementos, editá la hoja; la app no escribe en ella.
- Copia local de la última lectura en IndexedDB y shell de la app disponible offline.
- Instalación como PWA en dispositivos compatibles.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm.
- Una hoja de Google Sheets con pestañas de medicamentos e insumos, publicadas para lectura mediante sus URLs de exportación CSV.

> **Privacidad:** para que una app estática sin backend pueda leer la hoja, las pestañas deben ser accesibles con el enlace. No incluyas información privada o sensible en esa hoja. Las URLs configuradas en Vite se incluyen en el código del cliente y no son secretos.

## Desarrollo local

1. Instalá las dependencias:

   ```sh
   npm install
   ```

2. Copiá `.env.example` como `.env.local` y verificá las URLs de exportación CSV de cada pestaña:

   ```sh
   cp .env.example .env.local
   ```

   Las variables `MEDICINES_CSV_URL` y `SUPPLIES_CSV_URL` tienen que apuntar a los CSV correctos. Vite está configurado para exponer al navegador únicamente variables con los prefijos `MEDICINES_` y `SUPPLIES_`; sus valores son públicos, así que no guardes credenciales ni secretos allí.

3. Iniciá el servidor de desarrollo:

   ```sh
   npm run dev
   ```

4. Abrí la URL local que informa Vite. Para detener el servidor, usá `Ctrl+C`.

## Formato de las hojas

Los nombres de encabezados se normalizan sin distinguir mayúsculas ni acentos. Las columnas requeridas son:

### Medicamentos

| Encabezado | Requerido | Formato |
|---|---:|---|
| `nombre` | Sí | Nombre comercial |
| `dosis` | Sí | Texto, por ejemplo `500 mg` |
| `cantidad` | Sí | Entero no negativo |
| `vencimiento` | Sí | Fecha `AAAA-MM-DD` |
| `nombreGenerico` | No | Nombre genérico |
| `unidad` | No | Por ejemplo `cajas`, `piezas` o `blísteres`; si se omite, se muestra `unidades` |
| `forma` | No | `tableta`, `jarabe`, `crema`, `gotas`, `inhalador` u `otro`; si se omite, `otro` |
| `notas` | No | Texto libre |

### Insumos

| Encabezado | Requerido | Formato |
|---|---:|---|
| `nombre` | Sí | Nombre del insumo |
| `cantidad` | Sí | Entero no negativo |
| `unidad` | Sí | Por ejemplo `piezas`, `cajas`, `litros` o `paquetes` |
| `notas` | No | Texto libre |

Cada fila debe representar un elemento. Si un CSV no se puede leer o validar, la app muestra un error y conserva la última copia local disponible cuando exista.

## Variables de entorno para deploy

En Vercel, configurá `MEDICINES_CSV_URL` y `SUPPLIES_CSV_URL` en los ajustes del proyecto para los entornos que uses. Los valores se incorporan al bundle del navegador durante el deploy; no son secretos. Después de cambiar una URL, volvé a desplegar.

El deploy es estático: no se configura servidor propio ni backend de inventario.

## Capturas para portafolio

Para regenerar las capturas desktop y móvil con datos sintéticos:

```sh
npm run screenshots
```

El script levanta Vite temporalmente y guarda diez PNG en [`portfolio/screenshots/`](portfolio/screenshots/). Intercepta las URLs de ejemplo y no solicita los datos reales de la hoja. Ver [`portfolio/screenshots/README.md`](portfolio/screenshots/README.md) para el índice de imágenes.

## Tecnologías

React, Vite, Tailwind CSS, Zustand, Dexie/IndexedDB, `vite-plugin-pwa` y Playwright para las capturas de portafolio.
