# The Kali Project — Landing

Landing pública del proyecto **The Kali Project**.

## Qué hay en esta carpeta

```text
the-kali-project/
├── index.html
├── logo.png
├── voice-demo.mp3
├── voice-demo.wav
├── media/
│   └── gallery/
│       └── .gitkeep
└── README.md
```

## Tecnologías y arquitectura reflejadas en la landing

- **OpenClaw** como orquestador
- **OVOS** para voz local (wake word + salida de audio)
- **Home Assistant** para domótica
- **PC con Ollama** para modelo local ligero (Ministral)
- **Modelos cloud (orden real):**
  1. `GPT-5.3-codex` (principal)
  2. `Qwen 3.5 cloud` (backup #1)
  3. `Mistral Medium` (backup #2 / failover)

## Cambios visuales incluidos

- Barra superior transparente con navegación rápida por secciones
- Efecto sutil de desplazamiento lateral al hacer scroll (optimizado)
- Sección **Fotos & Media** con galería simple

## Dónde poner tus imágenes

Copia tus fotos en:

`the-kali-project/media/gallery/`

Nombres sugeridos para que aparezcan directamente en la galería actual:

- `01.jpg`
- `02.jpg`
- `03.jpg`
- `04.jpg`
- `05.jpg`
- `06.jpg`

Si falta alguna, la tarjeta aparece como hueco/placeholder sin romper el diseño.

## Prueba local

Desde `landings/the-kali-project/`:

```bash
python3 -m http.server 8080
```

Luego abre:

`http://localhost:8080/`

## Publicación

Sube cambios al repositorio `kali-sandin/landings` y GitHub Pages servirá:

`https://kali-sandin.github.io/landings/the-kali-project/`
