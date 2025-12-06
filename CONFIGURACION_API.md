# Configuración de API

## Backend Conectado

El frontend está ahora conectado al backend en producción:

```
https://rv-park-backend.onrender.com/api
```

## Cambiar entre Desarrollo Local y Producción

### Opción 1: Usando `.env.local` (Recomendado)

Edita el archivo `.env.local`:

**Para usar el backend en producción (Render):**
```env
VITE_API_BASE_URL=https://rv-park-backend.onrender.com/api
```

**Para usar el backend local:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Opción 2: Usando `.env`

Edita el archivo `.env`:

**Para producción:**
```env
VITE_API_BASE_URL=https://rv-park-backend.onrender.com/api
```

**Para desarrollo local:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Orden de Prioridad

Vite carga las variables de entorno en este orden (el último tiene más prioridad):

1. `.env` - Configuración base
2. `.env.local` - Configuración local (ignorado por git)
3. `.env.production` - Solo en build de producción
4. `.env.production.local` - Solo en build de producción (ignorado por git)

## Importante

- ⚠️ **Debes reiniciar el servidor de desarrollo** después de cambiar variables de entorno
- ⚠️ **Debes hacer un nuevo build** si cambias variables para producción
- ✅ Los archivos `.env.local` no se suben a git (más seguro para desarrollo)

## Comandos Útiles

```bash
# Reiniciar servidor de desarrollo
npm run dev

# Build para producción (usa .env.production si existe)
npm run build

# Preview del build de producción
npm run preview
```

## Verificar Configuración Actual

Puedes verificar qué URL está usando abriendo la consola del navegador y ejecutando:

```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

## Endpoints Disponibles

El backend en Render expone los siguientes endpoints:

- `/api/auth` - Autenticación
- `/api/rv-parks` - Gestión de RV Parks
- `/api/spots` - Gestión de Spots
- `/api/clientes` - Gestión de Clientes
- `/api/rentas` - Gestión de Rentas
- `/api/pagos` - Gestión de Pagos
- `/api/eventos` - Gestión de Eventos

## Estado del Backend

Puedes verificar el estado del backend visitando:

```
https://rv-park-backend.onrender.com/
```

Debería responder con:
```json
{
  "success": true,
  "message": "RV Park System API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

## Troubleshooting

### Error de CORS

Si ves errores de CORS, asegúrate de que el backend tenga configurado el origen correcto del frontend.

### Error 401 (No autorizado)

Asegúrate de estar logueado correctamente. El token JWT se almacena en `localStorage`.

### Backend dormido (Render)

Render pone a dormir los servicios gratuitos después de 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos en despertar el servicio.

### Timeout

Si el backend tarda mucho en responder, puede estar despertándose o tener problemas. Espera 1 minuto y reintenta.
