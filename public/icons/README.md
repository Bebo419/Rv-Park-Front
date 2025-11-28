# Íconos PWA

Esta carpeta debe contener los íconos para la Progressive Web App en los siguientes tamaños:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Generación de Íconos

Para generar íconos temporales de prueba, puedes usar herramientas online como:

1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
2. **RealFaviconGenerator**: https://realfavicongenerator.net/
3. **Favicon.io**: https://favicon.io/

O usa el siguiente comando con ImageMagick (si lo tienes instalado):

```bash
# Requiere ImageMagick
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:#3b82f6 \
    -gravity center -pointsize $((size/2)) -fill white \
    -annotate +0+0 "🚐" icon-${size}x${size}.png
done
```

## Íconos Temporales

Por ahora, puedes copiar el ícono de Vite (vite.svg del root) o crear un cuadrado azul simple para pruebas.
