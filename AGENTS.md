# AGENTS.md — mi-botiquin

## Misión
Implementar y mantener una PWA personal de inventario de medicamentos, offline-first, en español de México. Antes de cambiar comportamiento, leer `SPEC.md`, `ARCHITECTURE.md` y este archivo. El modelo de datos y restricciones del SPEC son el contrato del MVP.

## Stack y convenciones
- JavaScript con **React + Vite**; no TypeScript.
- Tailwind CSS, Zustand, Dexie.js, `vite-plugin-pwa`; deploy estático en Vercel.
- Fuente editable: Google Sheets publicado como CSV. La app solo lee las URLs configuradas; Dexie conserva snapshots para offline. No hay login ni escritura desde la PWA.
- Home, medicamentos e insumos son públicos y de solo lectura. La hoja actualmente indica «Público en la Web»; sus CSV son visibles para cualquiera con acceso a las URLs. No incluir datos que deban ser privados.
- Leer CSV con `fetch` nativo; validar el snapshot entero antes de guardarlo en Dexie. En fallo, conservar último snapshot válido.
- Mantener separación por feature: UI React → store Zustand → servicio/reglas → repositorio Dexie.
- Componentes React en `PascalCase`; variables/funciones en `camelCase`; constantes globales en `UPPER_SNAKE_CASE` solo si corresponde; carpetas y archivos utilitarios en `kebab-case`.
- Preferir componentes pequeños con responsabilidades claras y nombres de dominio (`MedicineCard`, `medicineRepository`). Evitar abstracciones prematuras.
- Mantener una pantalla principal mobile-first y dos secciones consultables: Medicamentos e Insumos; no agregar rutas ni formularios de escritura.
- Todo texto visible, mensajes de validación, etiquetas, fechas y confirmaciones se redactan en español (MX).

## Reglas de dominio
- Medicamento: `id`, `nombre`, `dosis`, `forma`, `cantidad`, `vencimiento`, `createdAt`, `updatedAt`; `unidad` es opcional para conservar compatibilidad con hojas anteriores; `nombreGenerico` y `notas` también son opcionales.
- `forma` solo admite `tableta`, `jarabe`, `crema`, `gotas`, `inhalador` u `otro`.
- `cantidad` es entero no negativo. `unidad` es una etiqueta de presentación/conteo; no convertir unidades ni fraccionar cantidades. En Sheets, ofrecer dropdowns de unidades apropiados por categoría. Si un CSV de medicamentos antiguo no trae `unidad`, usar `unidades` como fallback.
- `vencimiento` es obligatorio y se maneja como fecha civil `YYYY-MM-DD`, sin desplazar el día por zona horaria.
- Badges: vencido = rojo; vence hoy o dentro de 30 días = amarillo; más de 30 días = verde. Calcular por fecha local, comparando días de calendario.
- Búsqueda instantánea con coincidencia parcial, sin distinguir mayúsculas ni acentos, en nombre y nombre genérico.
- No mutar catálogos desde la app. Guardar en Dexie solo snapshots CSV completamente validados; ante error conservar y mostrar el último snapshot válido.

## Cómo usar el design system
La dirección vigente es artesanal/editorial, según el moodboard y el brief visual más reciente; reemplaza la composición anterior más limpia. Los roles y valores se centralizan en `src/styles/tokens.css`; no dispersar colores hex en pantallas.

- Paleta vigente: Burgundy Red `#721010`, Steel Blue `#8DA1B9`, Pebble Grey `#BCBDB8`, Sky Blue `#B7CCE3`, Mist Green `#E0E4DE`; superficies de contenido en crema `#FDF8F0`. Mantener estos roles en `src/styles/tokens.css`. El cuerpo lleva franjas sólidas repetidas Sky Blue de 40px y Burgundy Red de 20px (la roja mide la mitad), sin textura ni degradados; el contenido va dentro de una tarjeta crema centrada con radio y sombra sutiles.
- Home: usar Chubby Rounded local y en Burgundy Red para marca/nav y título; mostrar intencionalmente «botiquin» sin tilde porque el archivo de fuente no contiene `í`. La marca del nav está al 50% del tamaño anterior; el hero al 80% y centrado horizontal/verticalmente. Caveat local para «explorar». Junto a Chubby Rounded conservar la nota del autor: gratuita para uso personal; para uso comercial hay que contactar a imagex-fonts. Mantener todas las fuentes localmente; no cargar desde Google Fonts en runtime.
- Etiquetas editoriales: sans en mayúsculas, 10–12 px y tracking amplio; cuerpo ≥16 px. Spacing sobre unidad de 8 px (con subdivisiones de 4 px donde hagan falta). Cards 12–16 px; botones tipo píldora; sin sombras duras.
- Mantener paleta de marca y semántica de vencimiento en namespaces separados. Badges: verde Olive `#4F6815`/texto Oat `#F0E6DA`; amarillo Butter `#FFEDAB`/texto Cherry `#75070C`; rojo Cherry `#75070C`/texto Butter `#FFEDAB`. Estos pares se reservan para vencimiento, con contraste suficiente; conservar labels y fechas y no depender solo del color.
- Diseño mobile-first: 375 px como viewport base, una columna de tarjetas; mejorar densidad en desktop solo a partir de anchos que permitan tarjetas de al menos 360 px. Sin scroll horizontal; etiquetas editoriales pequeñas son la excepción explícita al tamaño mínimo del cuerpo.
- Implementar estilos repetibles en tokens/componentes base; no copiar valores arbitrarios por pantallas.
- La búsqueda se alinea a la izquierda y conserva separación inferior antes del listado. Cada medicamento muestra en el resumen solo nombre comercial, nombre genérico, dosis y cantidad+unidad (ej. `2 cajas`); el resto de datos se despliega con `<details>/<summary>` accesible.

## No hacer
- No agregar login, backend, API de escritura para Google Sheets, servicios de medicamentos, sincronización bidireccional, recordatorios o telemetría externa.
- No usar `localStorage` (ni como fallback). Para datos persistentes usar Dexie/IndexedDB.
- No añadir TypeScript; el usuario confirmó solo React + Vite.
- No instalar librerías adicionales sin pedir aprobación; parsear CSV con código nativo sencillo.
- No cachear CSV ni datos de inventario en Cache Storage; usar Dexie para snapshots de lectura offline y el service worker solo para shell/assets.
- No incluir consejos médicos ni presentar la app como sustituto de profesionales de salud.
- No inventar reglas o campos que contradigan `SPEC.md`; ante ambigüedad, anotar el supuesto y pedir decisión antes de cambiar alcance.
- No ejecutar builds: la instrucción del proyecto es no construir después de cambios.

## Ramas, Pull Requests y merge
- Crear una rama dedicada para cada feature; también usar ramas separadas para fixes, documentación u otros cambios independientes, de modo que cada conjunto de cambios quede trazable.
- No trabajar directamente sobre `main` (ni la rama protegida equivalente) y no mezclar features no relacionadas en la misma rama.
- Convención de nombres: `feat/nombre-corto`, `fix/nombre-corto`, `docs/nombre-corto` o `chore/nombre-corto`, en kebab-case. Ejemplo: `feat/busqueda-medicamentos`.
- Antes de abrir el PR, revisar el diff y confirmar que el alcance corresponde a la rama; el PR debe describir problema, solución, criterios de aceptación cubiertos y verificaciones realizadas/pendientes.
- Crear el PR cuando los cambios de la rama estén listos para revisión. No hacer merge hasta que los cambios estén aprobados por el usuario/revisor y se cumplan los checks acordados. No autoaprobar ni auto-mergear.
- Mantener el vínculo entre rama, commits y PR para que se pueda mapear claramente qué funcionalidad se añadió o modificó.

## Commits
- Usar Conventional Commits, con descripción en español: `tipo(alcance): descripción`.
- Tipos sugeridos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.
- Ejemplos: `feat(inventario): agrega búsqueda por nombre genérico`; `docs(planificacion): define criterios offline`.
- No agregar `Co-Authored-By` ni atribución de IA.

## Definition of Done
Una tarea está terminada cuando:
1. Cumple los criterios de aceptación aplicables de `SPEC.md` y no agrega alcance ajeno al MVP.
2. Respeta el design system, accesibilidad básica (labels, foco visible, botones con nombre accesible) y funciona desde 375 px sin scroll horizontal en la vista trabajada.
3. Los snapshots sobreviven recarga mediante IndexedDB; errores de carga remota no borran ni ocultan la última copia válida.
4. La validación de datos CSV contempla estados de carga/error; si no hay infraestructura de tests, documentar el hueco sin agregar librería sin aprobación.
5. Se revisa el diff y se verifica que no se introdujeron servicios de escritura, `localStorage`, dependencias no aprobadas ni cambios de diseño fuera de tokens.
6. No se ejecuta build después de cambios. Informar con precisión qué verificaciones permitidas se hicieron y cuáles quedan pendientes.

## Configuración pendiente
Las variables `MEDICINES_CSV_URL` y `SUPPLIES_CSV_URL` tienen endpoints de exportación CSV en `.env.local` (no versionado) y `.env.example` (plantilla versionada). La hoja está publicada en la web; confirmar que no contenga información privada y configurar ambas variables en Vercel para el deploy.
