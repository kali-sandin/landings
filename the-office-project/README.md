# The Office — Landing

Landing pública de The Office, añadida como proyecto independiente sin modificar la landing de Kali.

## Estructura

- index.html — narrativa, componentes y diagrama SVG accesible
- styles.css — diseño responsive con estética editorial + pixel art
- app.js — flujo interactivo y navegación
- ambient.js — rutas SVG ortogonales aleatorias, texto snake carácter a carácter
- diagram-flow.js — secuencia visual de interacciones cada 1,5 s
- lightbox.js — ampliación accesible de capturas en diálogo nativo
- assets/favicon.svg — favicon propio
- tests/test_landing.py — pruebas estáticas sin dependencias externas

## Capturas reales

Capturas en `assets/screenshots/`, integradas por contexto (no galería final):
- office-overview: hero.
- agent-thinking: observabilidad de actividad; ejemplo de pensamiento registrado.
- kanban-overview y task-detail: planificación.
- map-editor: editor del espacio de trabajo.
- project-editor: edición del proyecto activo.
- agent-detail: ficha de Richard / integración con OpenClaw.
- login.png: diseño de acceso original de The Office.
- deploy-history: trazabilidad.
- agent-profiles: ejemplo de equipo en RRHH.

Las imágenes conservan su proporción original. Al pulsarlas se abre un diálogo en la misma página; un clic sin ampliar, el botón Cerrar o Escape lo cierra con fade-out. Al ampliar, la imagen pasa a ser una superficie desplazable y el toque ya no la cierra; también puede abrirse el original en otra pestaña. El foco vuelve a la captura de origen; movimiento reducido elimina la animación.
Los avatares del equipo de ejemplo viven en `assets/team/`.

## Criterios de contenido y diseño

La landing presenta la visión del proyecto, no un informe de su estado operativo. El tono es técnico y descriptivo. Las secciones y tarjetas tienen espaciado compacto, con contenido legible y alturas flexibles; las capturas se distribuyen junto a las funciones que documentan y conservan sus proporciones originales. La hero utiliza una captura real. El equipo y los horarios se presentan como ejemplos configurables.

## Verificación

Desde la raíz del repositorio:

```sh
python3 -m unittest discover -s the-office-project/tests -v
node --check the-office-project/app.js
node --check the-office-project/lightbox.js
node the-office-project/tests/test_lightbox.js
node the-office-project/tests/test_motion.js
git diff --check
```

Para una revisión visual, abrir la web a 1440, 1024, 768, 390 y 320 px de ancho. Comprobar que el documento no desborda horizontalmente, que el diagrama y los pasos del flujo permiten desplazamiento interno, y que funcionan los controles anterior, siguiente, selección de paso y pausa/reanudación. Repetir con movimiento reducido y con JavaScript desactivado para comprobar la lectura del contenido.

La tira simula un turno completo de Richard, Jared, Bruce Lee y Gilfoyle: acción, comando y resultado diferenciados por color, con avatares. Repite dos grupos idénticos, sin gap externo: el desplazamiento -50% equivale exactamente al ancho de un grupo. No representa actividad en directo. Hover/foco la pausa; con movimiento reducido se detiene y permite desplazamiento manual.

## Prueba local

Desde la raíz del repositorio:

    python3 -m http.server 8080

Abrir:

    http://localhost:8080/the-office-project/

## Publicación

URL esperada en GitHub Pages:

    https://kali-sandin.github.io/landings/the-office-project/

## Diagrama y secuencia de ejemplo

El límite Raspberry Pi incluye The Office Service (Web, Control Plane, estado), OpenClaw local y Git local. Humano, agente remoto y Git remoto quedan fuera. La web media la interacción humana y recibe los eventos WS del control plane. Las flechas se etiquetan según su relación.

La secuencia nocturna se representa a escala: posición = minuto/420. Richard00:00 y07:00 (code reviews); Jared01:00; Gilfoyle01:30 (servicios) y06:30 (rendimiento/procesos zombies); Bruce cada30min02:00–06:00 (9turnos, último de consolidación). Es un ejemplo configurable, no una declaración de scheduler activo.

El fondo anima seis cadenas binarias con mensajes breves por sección oscura. Las rutas se calculan al montar o cambiar el ancho: cuadrícula de 48 px, tramos exclusivamente horizontales/verticales y giros aleatorios de 90 grados. SVG textPath distribuye los caracteres sobre el recorrido: el texto dobla las esquinas como una serpiente en lugar de desplazar un bloque. SMIL anima startOffset; no hay un elemento animado por letra, canvas, bucle de frames JS ni peticiones. Los tramos verticales son de 3–6 celdas (144–288px, limitados en los extremos del recorrido). Se pausa también cada sección fuera de vista. Tarjetas de equipo y cronología opacas impiden que el fondo se transparente entre la información. Se pausa con pestaña oculta o imagen ampliada, y desaparece con movimiento reducido.

Los textos auxiliares usan tamaños más legibles sin ampliar los títulos. El pie reserva su propia fila para la frase completa cuando no cabe junto a marca y enlace. Kali abre en una nueva pestaña externa. En el diagrama, OpenClaw y el Control Plane intercambian flechas horizontales; Git remoto se sitúa por debajo del límite de la Raspberry. El logotipo de servidor usa los cuatro rombos de la marca.

El agente remoto se alinea horizontalmente con Control Plane. OpenClaw usa rojo; Git remoto queda centrado bajo el servidor, con conexiones en L al clon local. Las flechas resaltadas simulan primero el recorrido humano y el agente local, y después un agente remoto: cambios cada 1,5 s, no telemetría. El temporizador se detiene si el diagrama no está visible, con pestaña oculta, imagen ampliada o movimiento reducido.

La cabecera del contorno físico es The Office Server (Raspberry Pi 5); el servicio interno usa amarillo/naranja, OpenClaw rojo y los repositorios gris/blanco. El agente remoto de ejemplo (Moss) dispone de un clon en su entorno y comparte el mismo remoto Git; los cuatro agentes locales tienen sus caras en OpenClaw. Observabilidad incluye dirección humana: instrucciones individuales o al chat común, no solo tareas del kanban. El pie centra su frase.

## Adaptación móvil y modelos de ejemplo

- Índice desplegable nativo hasta 1050px; cierra al elegir sección o pulsar Escape. La marca vuelve al principio del documento, no a una cabecera fija.
- Pasos de flujo con altura flexible (mínimo130px;142px móvil), sin scroll vertical interior y con pista de desplazamiento horizontal.
- Hasta780px se muestra una arquitectura vertical semántica; el diagrama completo se amplía opcionalmente. En escritorio el SVG encaja sin ancho mínimo ni scroll interno. La cronología conserva la escala y muestra una pista de desplazamiento.
- Lightbox: controles Cerrar, Ampliar/Ajustar y Ver original. Imagen ampliada con scroll táctil nativo y arrastre de ratón; la imagen ajustada mantiene el cierre por clic previo. Pellizco disponible según navegador; no se declara una prueba en hardware móvil físico.
- `scripts/export_architecture.py` genera `architecture.svg` a partir del SVG principal, con recursos embebidos y miniaturas WebP solo en la copia exportada (Pillow). Los originales no se modifican. Se carga únicamente al ampliar.
- Fichas: snapshot de la configuración consultada el24/11/2026, Richard/Jared/Gilfoyle OpenAI Sol5.6; Bruce GLM5.2. No cambia modelos ni automatizaciones. Iconos y atribución en `assets/providers`.
- Recursos CSS/JS versionados con `?v=20261124-mobile` para no mezclar versiones antiguas en caché.
