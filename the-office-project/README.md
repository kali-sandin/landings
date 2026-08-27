# The Office — Landing

Landing pública de The Office, añadida como proyecto independiente sin modificar la landing de Kali.

## Estructura

- index.html — narrativa, componentes y diagrama SVG accesible
- styles.css — diseño responsive con estética editorial + pixel art
- app.js — flujo interactivo, mini oficina, navegación, reveal y carga de capturas
- assets/favicon.svg — favicon propio
- assets/screenshots/README.md — nombres y guía para las capturas pendientes

## Capturas

Los placeholders permanecen visibles mientras no exista su imagen. Al subir un PNG con el nombre documentado en assets/screenshots/README.md, la captura aparecerá automáticamente.

## Prueba local

Desde la raíz del repositorio:

    python3 -m http.server 8080

Abrir:

    http://localhost:8080/the-office-project/

## Publicación

URL esperada en GitHub Pages:

    https://kali-sandin.github.io/landings/the-office-project/
