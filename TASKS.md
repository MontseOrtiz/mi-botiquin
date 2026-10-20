# TASKS — mi-botiquin

> Cada tarea está dimensionada para aproximadamente 1–2 horas. Si una tarea supera ese límite, dividirla antes de implementarla. Las ramas se crean por feature/cambio según `AGENTS.md`; los cambios no se mezclan entre ramas. No ejecutar builds después de los cambios.

## Fase 1 — Scaffolding

- [x] 1. Inicializar proyecto React + Vite con JavaScript y estructura base; acceptance: `src/`, `public/`, `index.html` y scripts de desarrollo quedan creados sin TypeScript.
- [x] 2. Definir convención Git de ramas para el repositorio; acceptance: cambios se trabajan en rama `feat/*`, `fix/*` o `chore/*` dedicada y nunca directamente en `main`.
- [x] 3. Instalar únicamente dependencias aprobadas (Tailwind, Zustand, Dexie, `vite-plugin-pwa`); acceptance: `package.json` contiene estas herramientas y no aparecen dependencias ajenas al stack sin aprobación.
- [x] 4. Configurar Tailwind y tokens CSS del design system; acceptance: colores, tipografía 400, spacing, radios y superficies quedan centralizados y sin sombras.
- [x] 5. Crear shell de aplicación y layout mobile-first; acceptance: encabezado y contenedor principal se muestran a 375 px sin desbordamiento horizontal.
- [x] 6. Crear componentes UI base Button, Input, Card y Badge; acceptance: aplican tokens y exponen estados accesibles de foco/disabled.
- [x] 7. Definir checklist de verificación manual del MVP; acceptance: los flujos principales tienen pasos repetibles que pueden ejecutarse en navegador sin instalar un runner automatizado.

## Fase 2 — Modelo

- [x] 8. Definir modelo `Medicamento` y opciones de forma en JavaScript; acceptance: los campos y opcionales coinciden con SPEC y formas solo acepta los seis valores permitidos.
- [x] 9. Implementar validación de alta/edición; acceptance: nombre, dosis, forma, cantidad entera no negativa y fecha de vencimiento válida son obligatorios y se rechazan entradas inválidas.
- [x] 10. Crear base Dexie y tabla `medicines`; acceptance: la base inicia correctamente, tiene versión de esquema declarada y persiste registros solo en IndexedDB.
- [x] 11. Implementar repositorio para listar, crear, actualizar y eliminar; acceptance: cada operación accede a Dexie y devuelve errores sin ocultarlos.
- [x] 12. Implementar servicio de dominio para timestamps, IDs y decremento; acceptance: altas asignan ID/fechas, edición conserva ID/createdAt y decremento nunca baja de cero.
- [x] 13. Implementar utilidades de fecha local y badge; acceptance: clasifica vencido rojo, hoy–30 días amarillo y >30 días verde con `YYYY-MM-DD` sin desfase UTC.
- [x] 14. Implementar normalización de búsqueda y orden; acceptance: compara sin acentos/mayúsculas con `includes()` sobre nombre/genérico y ordena por nombre en `es-MX`.

## Fase 3 — UI Lista

- [x] 15. Crear estado Zustand de inventario; acceptance: contiene lista, query, estado de carga/error y acciones async conectadas al servicio.
- [x] 16. Cargar inventario al iniciar la pantalla; acceptance: registros de IndexedDB aparecen ordenados y el fallo de lectura muestra error comprensible.
- [x] 17. Crear `MedicineCard` con datos esenciales y badge; acceptance: tarjeta muestra nombre, dosis, forma, cantidad y vencimiento legible en español de México.
- [x] 18. Crear lista y estados vacío/error; acceptance: inventario vacío invita a agregar y error de persistencia no se presenta como guardado exitoso.
- [x] 19. Crear búsqueda instantánea en encabezado; acceptance: filtra en tiempo real por nombre/genérico y limpia resultados al borrar el query.
- [x] 20. Crear estado sin coincidencias; acceptance: indica que no hay resultados, conserva la búsqueda escrita y ofrece acción para limpiarla.

## Fase 4 — CRUD

- [x] 21. Crear diálogo/panel de alta de medicamento; acceptance: captura todos los campos, marca opcionales y presenta errores accesibles junto al campo.
- [x] 22. Conectar alta a Zustand y Dexie; acceptance: registro válido se guarda, aparece en lista y sobrevive a recargar la app.
- [x] 23. Crear diálogo/panel de edición con valores precargados; acceptance: actualizar aplica validación, conserva ID/createdAt y modifica updatedAt.
- [x] 24. Implementar cancelación de alta/edición; acceptance: cerrar o cancelar no persiste cambios parciales ni altera el registro previo.
- [x] 25. Añadir acción rápida “Tomé una unidad”; acceptance: resta uno y persiste; con cantidad cero, acción deshabilitada y valor nunca negativo.
- [x] 26. Añadir eliminación con confirmación; acceptance: confirmación identifica el medicamento, cancelar conserva el registro y confirmar lo elimina de IndexedDB/lista.
- [x] 27. Comunicar éxito y error de mutaciones; acceptance: crear/editar/decrementar/eliminar reportan resultado sin ocultar errores de IndexedDB.

## Fase 5 — PWA

- [x] 28. Configurar `vite-plugin-pwa` y service worker; acceptance: el service worker precachea shell/assets locales sin cachear datos del inventario.
- [x] 29. Crear manifest e íconos de instalación; acceptance: manifest define nombre Mi botiquín, `display: standalone`, start/scope, colores e íconos válidos.
- [x] 30. Definir aviso de actualización de la app; acceptance: usuario recibe aviso de nueva versión sin interrumpir un formulario abierto.
- [ ] 31. Verificar apertura offline tras primera carga online; acceptance: shell abre sin red y las operaciones de inventario siguen funcionando desde IndexedDB.
- [x] 32. Manejar primera visita sin recursos cacheados; acceptance: no se muestra una pantalla en blanco y se explica que hace falta abrir la app online una vez.

## Fase 6 — Polish

- [ ] 33. Ajustar layout y tipografía a mobile 375 px; acceptance: formularios, tarjetas y acciones principales no generan scroll horizontal y el cuerpo no baja de 16 px.
- [x] 34. Revisar accesibilidad de formularios, diálogos y acciones; acceptance: controles tienen label/nombre accesible, foco visible, navegación por teclado y confirmación entendible.
- [x] 35. Verificar consistencia visual con design system; acceptance: paleta, peso 400, espaciado, radios y ausencia de sombras coinciden con tokens; colores de estado solo aparecen en badges.
- [ ] 36. Hacer revisión de aceptación manual en navegador; acceptance: en un navegador compatible se recorren alta, búsqueda, edición, decremento, eliminación, persistencia tras recarga, modo offline e instalabilidad, registrando resultados y fallas; no se configura runner automatizado por tratarse de un proyecto personal.
- [x] 37. Revisar límites del producto y el diff final; acceptance: no hay backend, APIs, `localStorage`, features non-goal ni dependencias no aprobadas.
- [ ] 38. Preparar PR de la rama de implementación; acceptance: PR resume alcance, criterios cubiertos, verificaciones y limitaciones, y no se hace merge hasta aprobación explícita y checks acordados.

## Post-MVP — v0.2

- Exportación/importación local del inventario (por ejemplo, JSON) con validación y confirmación antes de reemplazar datos.
- Historial local de cambios de cantidad, si el usuario necesita auditar consumos.
- Filtros por forma y estado de vencimiento.
- Orden configurable por vencimiento, nombre o cantidad.
- Respaldo/restauración manual cifrada, definiendo primero el modelo de seguridad y manejo de clave.
- Accesos rápidos y mejoras de accesibilidad/usabilidad basadas en uso real.

## Decisiones confirmadas

- No se agregará una tarea para configurar un runner de pruebas automatizadas.
- La verificación de offline e instalabilidad será manual en navegador, acorde a que es un proyecto personal.
