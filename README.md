# Landings de Kali

Repositorio de páginas estáticas para demos y landings de **The Kali Project**.

## Contenido actual

```text
landings/
├── kali_assistant.html                 # Landing legacy (single-file)
├── README.md
└── the-kali-project/
    ├── index.html                      # Landing principal actual
    ├── logo.png
    ├── voice-demo.mp3
    ├── voice-demo.wav
    ├── media/
    │   └── gallery/
    │       └── .gitkeep               # Carpeta donde colocar fotos
    └── README.md
```

## Landing principal

- Ruta: `the-kali-project/index.html`
- URL esperada en GitHub Pages:
  - `https://kali-sandin.github.io/landings/the-kali-project/`

## Stack usado

- HTML + CSS + JavaScript vanilla
- Diseño responsive
- Efectos visuales ligeros (canvas sutil, scroll lateral suave por secciones)

## Flujo rápido de trabajo

```bash
cd landings
# editar archivos
git add .
git commit -m "update landing"
git push
```

## Notas

- Este repo solo guarda contenido público de landings.
- No incluir información privada ni archivos del workspace personal.
