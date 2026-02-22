# The Kali Project - Landing Page

Este es el landing page para **The Kali Project**, un asistente de IA personal diseñado para facilitar tu día a día.

## Estructura del Proyecto
```
the-kali-project/
├── index.html          # Página principal (HTML + CSS + JS all-in-one)
├── assets/             # Carpeta para recursos estáticos
│   ├── kali-logo.svg   # Logo del proyecto
│   └── diagram.png     # Diagrama del flujo de Kali (opcional)
└── README.md           # Este archivo
```

## ¿Cómo desplegar?
1. **GitHub Pages**:
   - Sube este directorio al repositorio `kali-sandin/landings`.
   - Asegúrate de que GitHub Pages esté habilitado en *Settings > Pages* con la rama `main` y la carpeta `/root`.
   - La URL será: `https://kali-sandin.github.io/landings/the-kali-project/`

2. **AWS S3 (opcional)**:
   - Sube los archivos a un bucket S3 configurado para hosting estático.
   - Configura los permisos y la política del bucket para permitir acceso público.

## Personalización
- **Contenido**: Edita el archivo `index.html` para modificar textos, colores o secciones.
- **Demo de voz**: En local, la función `playVoiceDemo()` ejecuta `ovos-speak` para reproducir un mensaje de voz. En GitHub Pages, se simula con un `alert`.
- **Diagrama interactivo**: Usa [Mermaid.js](https://mermaid.js.org/) para modificar el diagrama de flujo en el HTML.

## Notas
- **Voz femenina**: El bugfix para usar voz femenina en OVOS ya está integrado en el código.
- **Changelog**: Actualiza la sección de historial de mejoras en el HTML según evolucione el proyecto.

---
*Hecho con ❤️ por Jorge y Kali.*