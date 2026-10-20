# AGENTS.md — mi-botiquin

## Misión
Implementar y mantener una PWA personal de inventario de medicamentos, offline-first, en español de México. Antes de cambiar comportamiento, leer `SPEC.md`, `ARCHITECTURE.md` y este archivo. El modelo de datos y restricciones del SPEC son el contrato del MVP.

## Stack y convenciones
- JavaScript con **React + Vite**; no TypeScript.
- Tailwind CSS, Zustand, Dexie.js, `vite-plugin-pwa`; deploy estático en Vercel.
- Persistencia de medicamentos solo en IndexedDB vía Dexie. No usar `localStorage`, backend, APIs ni sincronización.
- Mantener separación por feature: UI React → store Zustand → servicio/reglas → repositorio Dexie.
- Componentes React en `PascalCase`; variables/funciones en `camelCase`; constantes globales en `UPPER_SNAKE_CASE` solo si corresponde; carpetas y archivos utilitarios en `kebab-case`.
- Preferir componentes pequeños con responsabilidades claras y nombres de dominio (`MedicineCard`, `medicineRepository`). Evitar abstracciones prematuras.
- Mantener una pantalla principal mobile-first y usar diálogo/panel para alta y edición; no agregar rutas si no hay necesidad de producto.
- Todo texto visible, mensajes de validación, etiquetas, fechas y confirmaciones se redactan en español (MX).

## Reglas de dominio
- Medicamento: `id`, `nombre`, `dosis`, `forma`, `cantidad`, `vencimiento`, `createdAt`, `updatedAt`; `nombreGenerico` y `notas` opcionales.
- `forma` solo admite `tableta`, `jarabe`, `crema`, `gotas`, `inhalador` u `otro`.
- `cantidad` es entero no negativo. La acción “Tomé una unidad” resta exactamente uno y nunca permite valores negativos.
- `vencimiento` es obligatorio y se maneja como fecha civil `YYYY-MM-DD`, sin desplazar el día por zona horaria.
- Badges: vencido = rojo; vence hoy o dentro de 30 días = amarillo; más de 30 días = verde. Calcular por fecha local, comparando días de calendario.
- Búsqueda instantánea con coincidencia parcial, sin distinguir mayúsculas ni acentos, en nombre y nombre genérico.
- Toda mutación debe persistirse correctamente en Dexie antes de comunicar éxito; mostrar errores de persistencia sin fingir que se guardó.

## Cómo usar el design system
La fuente de verdad son los tokens del usuario en `DESIGN.md` y `tokens.json` (referencias originales disponibles en `/Users/montseortiz/Downloads/`). No redefinir tokens existentes ni introducir una paleta nueva.

- Colores base: violeta `#b154f9`, negro `#000000`, blanco `#ffffff`, mist `#f1f1f1`, charcoal `#171717`, steel `#6c6b6b`, fog `#b3b3b3`.
- Usar violeta como único color de marca para acciones primarias/interacción activa; el sistema usa peso tipográfico 400, sin 600/700.
- Spacing sobre unidad de 4 px; preferir valores provistos (4, 8, 12, 16, 20, 32, 48, etc.). Cards y botones radio 8 px; contenedores grandes 14 px. Sin sombras.
- Mantener superficies blancas/grises claras y jerarquía con tamaño/espaciado, no con peso bold.
- En mobile (base 375 px), reducir tipografía display de desktop cuando haga falta; texto del cuerpo no menor a 16 px.
- Verde/amarillo/rojo se permiten únicamente para los badges semánticos de vencimiento acordados en SPEC, con contraste suficiente. No reutilizarlos como colores de marca.
- Implementar estilos repetibles en tokens/componentes base; no copiar valores arbitrarios por pantallas.

## No hacer
- No agregar backend, servidor, API, login, multiusuario, sincronización, recordatorios o telemetría externa.
- No usar `localStorage` (ni como fallback). Para datos persistentes usar Dexie/IndexedDB.
- No añadir TypeScript; el usuario confirmó solo React + Vite.
- No instalar librerías adicionales sin pedir aprobación. Resolver con capacidades nativas o dependencias ya acordadas.
- No cachear datos personales del inventario en Cache Storage; el service worker cachea únicamente shell/assets de la app.
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
3. Los datos sobreviven recarga mediante IndexedDB; las operaciones contemplan estados de carga/error y no ocultan fallas.
4. La lógica nueva tiene cobertura de pruebas acorde a la convención que se establezca para el proyecto; si no hay infraestructura de tests, documentar el hueco sin agregar librería sin aprobación.
5. Se revisa el diff y se verifica que no se introdujeron backend, `localStorage`, dependencias nuevas ni cambios de diseño fuera de tokens.
6. No se ejecuta build después de cambios. Informar con precisión qué verificaciones permitidas se hicieron y cuáles quedan pendientes.

## Preguntas para el usuario
No hay decisiones pendientes para este documento; stack, vencimiento obligatorio y flujo de diálogo/panel quedaron confirmados.
