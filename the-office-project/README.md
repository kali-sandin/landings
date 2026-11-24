# The Office — Landing

Landing pública de The Office, añadida como proyecto independiente sin modificar la landing de Kali.

## Estructura

- index.html — narrativa, componentes y diagrama SVG accesible
- styles.css — diseño responsive con estética editorial + pixel art
- app.js — flujo interactivo, mini oficina, navegación, reveal y carga de capturas
- assets/favicon.svg — favicon propio
- tests/test_landing.py — pruebas estáticas sin dependencias externas

## Capturas reales

Siete JPG en `assets/screenshots/`, integrados por contexto (no galería final):
- office-overview: hero.
- agent-thinking: presencia.
- kanban-overview y task-detail: planificación.
- map-editor: configuración.
- deploy-history: trazabilidad.
- agent-profiles: ejemplo de equipo en RRHH.

Las imágenes conservan su proporción original y abren el original al pulsarlas.
Los avatares del equipo de ejemplo viven en `assets/team/`.

## Criterios de contenido y diseño

La landing presenta la visión del proyecto, no un informe de su estado operativo. El tono es técnico y descriptivo. Las secciones y tarjetas tienen espaciado compacto, con contenido legible y alturas flexibles; la galería usa tres columnas en escritorio, dos en tablet y una en móvil. La hero utiliza una captura real. El equipo y los horarios se presentan como ejemplos configurables.

## Verificación

Desde la raíz del repositorio:

```sh
python3 -m unittest discover -s the-office-project/tests -v
node --check the-office-project/app.js
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
