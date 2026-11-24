# The Office — Landing

Landing pública de The Office, añadida como proyecto independiente sin modificar la landing de Kali.

## Estructura

- index.html — narrativa, componentes y diagrama SVG accesible
- styles.css — diseño responsive con estética editorial + pixel art
- app.js — flujo interactivo, navegación y trazos de fondo CSS
- lightbox.js — ampliación accesible de capturas en diálogo nativo
- assets/favicon.svg — favicon propio
- tests/test_landing.py — pruebas estáticas sin dependencias externas

## Capturas reales

Capturas en `assets/screenshots/`, integradas por contexto (no galería final):
- office-overview: hero.
- agent-thinking: intención/pensamiento visible.
- kanban-overview y task-detail: planificación.
- map-editor: editor del espacio de trabajo.
- project-editor: edición del proyecto activo.
- agent-detail: ficha de Richard / integración con OpenClaw.
- login.png: diseño de acceso original de The Office.
- deploy-history: trazabilidad.
- agent-profiles: ejemplo de equipo en RRHH.

Las imágenes conservan su proporción original. Al pulsarlas se abre un diálogo en la misma página; cualquier clic o Escape lo cierra con fade-out. El foco vuelve a la captura de origen; movimiento reducido elimina la animación.
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
git diff --check
```

Para una revisión visual, abrir la web a 1440, 1024, 768, 390 y 320 px de ancho. Comprobar que el documento no desborda horizontalmente, que el diagrama y los pasos del flujo permiten desplazamiento interno, y que funcionan los controles anterior, siguiente, selección de paso y pausa/reanudación. Repetir con movimiento reducido y con JavaScript desactivado para comprobar la lectura del contenido.

La tira repite dos grupos idénticos, sin gap externo: el desplazamiento -50% equivale exactamente al ancho de un grupo. Con movimiento reducido se detiene.

## Prueba local

Desde la raíz del repositorio:

    python3 -m http.server 8080

Abrir:

    http://localhost:8080/the-office-project/

## Publicación

URL esperada en GitHub Pages:

    https://kali-sandin.github.io/landings/the-office-project/

## Diagrama y secuencia de ejemplo

El límite Raspberry Pi incluye The Office Server (Web, Control Plane, estado), OpenClaw local y Git local. Humano, agente remoto y Git remoto quedan fuera. La web media la interacción humana y recibe los eventos WS del control plane. Las flechas se etiquetan según su relación.

La secuencia nocturna se representa a escala: posición = minuto/360. Richard00:00; Jared01:00; Bruce cada15min02:00–06:00 (17turnos, último de consolidación). Es un ejemplo configurable, no una declaración de scheduler activo.

El fondo anima seis trazos por sección oscura usando solo transform/opacity en CSS; no canvas ni bucle de frames JS ni peticiones. Se pausa con pestaña oculta o imagen ampliada, y desaparece con movimiento reducido.
