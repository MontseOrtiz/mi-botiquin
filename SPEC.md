# SPEC — mi-botiquin

## Problema
En casa se compran medicamentos que quizá ya están disponibles porque no existe una forma rápida y confiable de consultar el inventario. La PWA permitirá revisar cantidades y vencimientos antes de ir a la farmacia, incluso sin conexión.

## User Stories y criterios de aceptación

### US1 — Consultar inventario
Como usuario, quiero ver mis medicamentos con su información esencial para saber qué tengo en casa.

**Criterios de aceptación**
- Los catálogos publicados, sus búsquedas y datos se muestran públicamente; la interfaz no ofrece acciones de alta, edición, decremento ni eliminación.
- Al abrir la app, se muestra primero el último snapshot persistido en IndexedDB y se intenta actualizar desde la fuente CSV publicada; medicamentos se ordenan por nombre ascendente.
- Cada fila resumida muestra nombre comercial, nombre genérico (si existe), dosis y cantidad disponible con unidad (por ejemplo, `2 cajas`); si la columna `unidad` está vacía o ausente se muestra `unidades`. Al expandir muestra forma, vencimiento y notas si existen.
- El detalle expandido muestra un badge de vencimiento con estado semántico: verde si faltan más de 30 días, amarillo si faltan entre 0 y 30 días inclusive, y rojo si la fecha ya pasó.
- Si no hay medicamentos, se muestra un estado vacío informativo.
- Si falla IndexedDB o la actualización remota, se muestra un mensaje comprensible y se conserva el último snapshot válido cuando sea posible.

### US2 — Buscar medicamentos
Como usuario, quiero buscar por nombre comercial o genérico para comprobar rápidamente si ya tengo un medicamento.

**Criterios de aceptación**
- La búsqueda está disponible públicamente sobre el inventario local mostrado.
- Hay un campo de búsqueda visible en la pantalla de inventario.
- La lista se filtra mientras se escribe, sin botón de envío, usando coincidencia parcial (`includes`) sin distinguir mayúsculas/minúsculas ni acentos en `nombre` y `nombreGenerico`.
- El resultado se actualiza en un máximo de 200 ms para una lista local de hasta 1,000 medicamentos.
- Al limpiar la búsqueda vuelve a mostrarse el inventario completo.
- Cuando no hay coincidencias, aparece un estado vacío específico que conserva el texto buscado y permite borrarlo.

### US3 — Consultar insumos domésticos
Como usuario, quiero consultar en una sección separada los insumos de primeros auxilios para saber qué hay disponible.

**Criterios de aceptación**
- Hay secciones separadas «Medicamentos» e «Insumos», alimentadas por fuentes CSV distintas de Google Sheets.
- Cada insumo muestra nombre, cantidad, unidad y notas opcionales; `unidad` se elige en Google Sheets desde una lista desplegable.
- La búsqueda instantánea filtra los insumos por nombre/notas sin distinguir mayúsculas ni acentos.
- La app es de solo lectura: altas, ediciones y eliminaciones se hacen en Google Sheets, no en la interfaz.

### US4 — Actualizar desde Google Sheets
Como usuaria, quiero mantener una fuente central editable en Google Sheets y que la app lea su versión publicada.

**Criterios de aceptación**
- La app consulta en línea las URLs CSV públicas configuradas por variable de entorno, una para medicamentos y otra para insumos.
- Al iniciar, la app carga primero el último snapshot válido almacenado en Dexie y luego intenta refrescar cada fuente en línea.
- Una respuesta inválida, un error de red o una URL sin configurar no reemplaza ni borra el último snapshot válido; se informa el problema sin ocultar los datos cacheados.
- Las filas se validan antes de sustituir el snapshot completo; se reporta qué fila/columna es inválida.
- La app no contiene formularios ni controles de escritura de inventario, autenticación ni credenciales de Google.
- Los CSV publicados son de solo lectura y sus datos quedan visibles para quien tenga acceso a la URL publicada.

### US5 — Usar la app sin conexión
Como usuario, quiero consultar mi inventario sin internet para que sea útil en casa o en la farmacia.

**Criterios de aceptación**
- Después de una primera carga y sincronización online, la app puede volver a abrir sin conexión desde el mismo dispositivo/navegador usando los snapshots locales de Dexie.
- Consultar, buscar y filtrar los últimos snapshots funciona sin conexión; la app no escribe ni modifica inventario.
- No hay backend ni autenticación; la única lectura remota es GET a las URLs CSV públicas de Google Sheets cuando hay conexión.
- Si la instalación no cuenta aún con los recursos cacheados, se presenta una indicación útil en vez de una pantalla en blanco.

### US6 — Instalar la PWA
Como usuario, quiero instalar la app en la pantalla de inicio para abrirla como una aplicación.

**Criterios de aceptación**
- Se entrega manifest válido con nombre “Mi botiquín”, nombre corto, colores de tema/fondo, `display: standalone` e íconos requeridos.
- En navegadores compatibles, la app cumple condiciones instalables y se puede abrir en modo standalone.
- La interfaz es usable a partir de 375 px de ancho, sin scroll horizontal en las vistas principales.

### US7 — Mantener el catálogo en la hoja central
Como usuaria, quiero actualizar medicamentos e insumos en Google Sheets para que la app refleje una lista única compartida.

**Criterios de aceptación**
- La app consume archivos CSV publicados como lectura; los cambios se realizan directamente en las hojas de Google Sheets.
- Cada clase de datos tiene una URL CSV publicada propia; publicar una hoja no requiere compartir credenciales con la app.
- Las URLs se configuran como `MEDICINES_CSV_URL` y `SUPPLIES_CSV_URL` en entorno local y Vercel.
- Una app pública de lectura expone los datos publicados; no se presenta como inventario privado.

## Non-Goals
- Inicio de sesión, administración de usuarios, edición de inventario dentro de la app o API de escritura de Google Sheets.
- Backend propio, sincronización bidireccional, notificaciones/recordatorios o multi-dispositivo en tiempo real.
- Recordatorios de toma, horarios, historial de tratamientos o consejos médicos.
- Escaneo de códigos, OCR, recetas o integración con farmacias.
- Sustituir el criterio de un profesional de salud; la app es solo un inventario personal.

## Supuestos / decisiones asumidas

- <!-- ASUNCIÓN: `vencimiento` representa una fecha de calendario local y se serializa como `YYYY-MM-DD`; no se interpreta como instante UTC para evitar cambios de día por zona horaria. -->
- El usuario confirmó los umbrales: vencido rojo; vence hoy y hasta 30 días, amarillo; más de 30 días, verde. El cálculo se hace por fecha local, no por hora.
- `cantidad` es un conteo entero no negativo; `unidad` indica el tipo de presentación/conteo y se mantiene como etiqueta sin conversiones ni fracciones. Medicamentos: `unidades`, `piezas`, `cajas`, `blísteres`, `frascos`, `tubos`, `sobres`, `ampolletas` o `inhaladores`; insumos admiten además `litros`, `mililitros`, `paquetes`, `rollos` y `pares`.
- <!-- ASUNCIÓN: la búsqueda normaliza acentos (por ejemplo, “ácido” coincide con “acido”), además de ignorar mayúsculas/minúsculas. -->
- <!-- ASUNCIÓN: los IDs se generan en el cliente con `crypto.randomUUID()` cuando esté disponible, con alternativa local segura compatible con los navegadores objetivo; nunca se requiere servidor. -->
- Paleta vigente: Burgundy Red `#721010`, Steel Blue `#8DA1B9`, Pebble Grey `#BCBDB8`, Sky Blue `#B7CCE3`, Mist Green `#E0E4DE`. El home conserva relación móvil 9:16 y ocupa 100% del ancho disponible; nav con marca «botiquin» (sin tilde, por limitación del glifo en Chubby Rounded) a la izquierda y enlace «Consultar inventario» a la derecha; título «botiquin» en Chubby Rounded Burgundy Red, visible completo en mobile, centrado horizontal/verticalmente y al 80% del tamaño previo. La marca del nav se muestra al 50% del tamaño previo. El hero no muestra imagen; conserva CTA «explorar» en Caveat. El hero tiene fondo crema plano `#FDF8F0`. El resto usa franjas verticales sólidas de 40 px Sky Blue y 20 px Burgundy Red (la roja equivale a la mitad de la azul), repetidas; el panel centrado de búsqueda/inventario/footer es crema `#FDF8F0`, suavemente redondeado y con sombra sutil. La búsqueda queda alineada a la izquierda con espacio inferior antes del listado. El resumen de cada medicamento muestra nombre comercial, nombre genérico, dosis y unidades; al expandir se ven forma, vencimiento y notas si existen, sin controles de edición. Sin textura visible ni degradados. Chubby Rounded se distribuye con la nota del autor “free for personal use”; contactar a imagex-fonts para uso comercial. Todas las fuentes se empaquetan localmente para offline.
- El home y los catálogos son públicos y de solo lectura. Google Sheets es fuente editable central; Dexie guarda snapshots para consulta offline. Cualquier persona con la URL CSV publicada puede leer los datos incluidos en ella.
- Los badges de vencimiento usan exclusivamente su paleta semántica aprobada (Olive/Oat, Butter/Cherry, Cherry/Butter), separada de los tokens de marca; conservar labels textuales y fechas, no usar esos colores en acciones o decoración.
- Los textos, fechas y mensajes están en español de México; no se guardan datos en `localStorage`.

## Pendiente de configuración
- Los endpoints CSV ya están configurados en `.env.local` y documentados en `.env.example`; la hoja actualmente indica «Público en la Web».
- Confirmar que la hoja no contenga información privada, configurar también las variables en Vercel y validar actualización remota desde el deploy.
