# SPEC — mi-botiquin

## Problema
En casa se compran medicamentos que quizá ya están disponibles porque no existe una forma rápida y confiable de consultar el inventario. La PWA permitirá revisar cantidades y vencimientos antes de ir a la farmacia, incluso sin conexión.

## User Stories y criterios de aceptación

### US1 — Consultar inventario
Como usuario, quiero ver mis medicamentos con su información esencial para saber qué tengo en casa.

**Criterios de aceptación**
- Al abrir la app, se muestra el inventario persistido localmente en IndexedDB, ordenado por nombre ascendente (ignorando mayúsculas y acentos).
- Cada medicamento muestra nombre, dosis, forma, cantidad y vencimiento en formato legible para español de México.
- Cada tarjeta muestra un badge de vencimiento con estado semántico: verde si faltan más de 30 días, amarillo si faltan entre 0 y 30 días inclusive, y rojo si la fecha ya pasó.
- Si no hay medicamentos, se muestra un estado vacío con una acción clara para agregar el primero.
- Si IndexedDB falla, la app muestra un mensaje de error comprensible y no aparenta que el cambio quedó guardado.

### US2 — Buscar medicamentos
Como usuario, quiero buscar por nombre comercial o genérico para comprobar rápidamente si ya tengo un medicamento.

**Criterios de aceptación**
- Hay un campo de búsqueda visible en la pantalla de inventario.
- La lista se filtra mientras se escribe, sin botón de envío, usando coincidencia parcial (`includes`) sin distinguir mayúsculas/minúsculas ni acentos en `nombre` y `nombreGenerico`.
- El resultado se actualiza en un máximo de 200 ms para una lista local de hasta 1,000 medicamentos.
- Al limpiar la búsqueda vuelve a mostrarse el inventario completo.
- Cuando no hay coincidencias, aparece un estado vacío específico que conserva el texto buscado y permite borrarlo.

### US3 — Agregar medicamento
Como usuario, quiero registrar un medicamento para incluirlo en mi inventario local.

**Criterios de aceptación**
- El formulario permite capturar nombre, nombre genérico (opcional), dosis, forma, cantidad, vencimiento y notas (opcional).
- `nombre`, `dosis`, `forma`, `cantidad` y `vencimiento` son obligatorios; cantidad es un entero mayor o igual a 0 y vencimiento es una fecha válida.
- `forma` solo acepta `tableta`, `jarabe`, `crema`, `gotas`, `inhalador` u `otro`.
- Los errores aparecen junto al campo correspondiente y se anuncian de forma accesible; no se persiste un registro inválido.
- Al guardar con éxito se asignan `id`, `createdAt` y `updatedAt`; el registro aparece en la lista y sobrevive a recargar/cerrar y volver a abrir la app.
- El éxito o fallo de guardado se informa explícitamente al usuario.

### US4 — Editar medicamento
Como usuario, quiero corregir los datos de un medicamento para mantener el inventario confiable.

**Criterios de aceptación**
- Desde cada tarjeta puedo abrir el formulario de edición con los valores actuales precargados.
- La edición aplica las mismas validaciones que el alta.
- Al guardar, `id` y `createdAt` se conservan, `updatedAt` cambia y el registro actualizado se refleja en la lista.
- Cancelar la edición no modifica los datos persistidos.

### US5 — Restar una unidad consumida
Como usuario, quiero indicar rápidamente que tomé una unidad para mantener actualizada la cantidad disponible.

**Criterios de aceptación**
- Cada medicamento con cantidad mayor a 0 ofrece la acción accesible “Tomé una unidad”.
- La acción decrementa la cantidad exactamente en 1 y actualiza `updatedAt`.
- Si la cantidad es 0, la acción está deshabilitada/no disponible y no puede generar valores negativos.
- El cambio persiste en IndexedDB y la tarjeta se actualiza sin recargar la página.

### US6 — Eliminar medicamento
Como usuario, quiero eliminar un registro para retirar del inventario lo que ya no necesito controlar.

**Criterios de aceptación**
- La acción de eliminar solicita confirmación e identifica el medicamento por nombre.
- Cancelar conserva el registro; confirmar lo elimina de IndexedDB y de la lista.
- El resultado de la operación se comunica y la lista muestra el estado vacío si se eliminó el último registro.

### US7 — Usar la app sin conexión
Como usuario, quiero consultar y actualizar mi inventario sin internet para que sea útil en casa o en la farmacia.

**Criterios de aceptación**
- Después de una primera carga completada con conexión, la app vuelve a abrir sin conexión desde el mismo dispositivo/navegador.
- Crear, editar, buscar, restar cantidad y eliminar funcionan sin conexión y guardan datos localmente.
- La app no realiza llamadas a backend ni a APIs externas para operar.
- Si la instalación no cuenta aún con los recursos cacheados, se presenta una indicación útil en vez de una pantalla en blanco.

### US8 — Instalar la PWA
Como usuario, quiero instalar la app en la pantalla de inicio para abrirla como una aplicación.

**Criterios de aceptación**
- Se entrega manifest válido con nombre “Mi botiquín”, nombre corto, colores de tema/fondo, `display: standalone` e íconos requeridos.
- En navegadores compatibles, la app cumple condiciones instalables y se puede abrir en modo standalone.
- La interfaz es usable a partir de 375 px de ancho, sin scroll horizontal en las vistas principales.

## Non-Goals
- Login, cuentas, perfiles, multiusuario o permisos.
- Backend, API, sincronización, respaldo remoto o multi-dispositivo.
- Recordatorios de toma, horarios, historial de tratamientos o consejos médicos.
- Escaneo de códigos, OCR, recetas o integración con farmacias.
- Sustituir el criterio de un profesional de salud; la app es solo un inventario personal.

## Supuestos / decisiones asumidas

- <!-- ASUNCIÓN: `vencimiento` representa una fecha de calendario local y se serializa como `YYYY-MM-DD`; no se interpreta como instante UTC para evitar cambios de día por zona horaria. -->
- El usuario confirmó los umbrales: vencido rojo; vence hoy y hasta 30 días, amarillo; más de 30 días, verde. El cálculo se hace por fecha local, no por hora.
- `cantidad` es un conteo entero de unidades disponibles; no se modelan unidades de medida ni fracciones en el MVP. Confirmado por el usuario.
- <!-- ASUNCIÓN: la búsqueda normaliza acentos (por ejemplo, “ácido” coincide con “acido”), además de ignorar mayúsculas/minúsculas. -->
- <!-- ASUNCIÓN: los IDs se generan en el cliente con `crypto.randomUUID()` cuando esté disponible, con alternativa local segura compatible con los navegadores objetivo; nunca se requiere servidor. -->
- El origen de verdad visual es `/Users/montseortiz/Downloads/DESIGN.md` y `/Users/montseortiz/Downloads/tokens.json`: fondo blanco, texto negro, acento violeta `#b154f9`, escala de grises, tipografía peso 400, base de spacing 4 px, cards/botones de radio 8 px, sin sombras. La escala de fuentes se adapta a mobile para evitar titulares de 64–80 px en pantallas de 375 px, como confirmó el usuario.
- <!-- ASUNCIÓN: los badges de vencimiento son una excepción semántica necesaria a la paleta de marca monocromática; usan verde/amarillo/rojo solo para el estado, con contraste legible, y no como acentos decorativos ni botones. -->
- Los textos, fechas y mensajes están en español de México; no se guardan datos en `localStorage`.

## Preguntas para el usuario
1. Confirmado: vencido rojo; vence hoy–30 días amarillo; más de 30 días verde.
2. El modelo define `vencimiento` como obligatorio; si preferís permitir medicamentos sin fecha de vencimiento, confirmámelo.
3. Confirmado: adaptar la escala tipográfica desktop a mobile.
