# 🚀 Guía de Configuración e Integración

## Estado del Proyecto

✅ **Proyecto construido exitosamente**

El frontend PWA de RV Park Manager está listo para integrarse con el backend Express.

## 📋 Checklist de Implementación

### Frontend (Completado ✅)

- [x] Proyecto React + Vite configurado
- [x] Tailwind CSS v3 instalado y configurado
- [x] PWA configurada con vite-plugin-pwa
- [x] Service Worker generado automáticamente
- [x] Manifest.json configurado
- [x] Íconos placeholder creados (reemplazar con íconos finales)
- [x] Estructura de carpetas organizada
- [x] Componentes reutilizables creados
- [x] Servicios API con interceptores JWT
- [x] Sistema de autenticación con Context
- [x] Rutas protegidas implementadas
- [x] Panel visual de espacios (Dashboard)
- [x] Sistema de colores por estado
- [x] Módulo de gestión de Spots
- [x] Exportación de reportes (PDF, Excel, CSV)
- [x] Soporte offline con localStorage

### Backend (Pendiente)

- [ ] API REST en Express configurada
- [ ] Endpoints de autenticación
- [ ] Endpoints CRUD para Spots
- [ ] Endpoints CRUD para Rentas
- [ ] Endpoints CRUD para Pagos
- [ ] Endpoints CRUD para Clientes
- [ ] Endpoints de Reportes
- [ ] CORS configurado para permitir frontend
- [ ] JWT configurado y funcionando

## 🔧 Configuración

### 1. Configurar Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

**Importante**: Cambia la URL según donde esté corriendo tu backend.

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Construir para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

### 5. Vista Previa de Producción

```bash
npm run preview
```

## 🔌 Integración con Backend

### Estructura de API Esperada

El frontend espera que el backend tenga los siguientes endpoints:

#### Autenticación

```
POST /api/auth/login
Body: { username: string, password: string }
Response: { token: string, user: { id, nombre, rol } }
```

#### Spots

```
GET    /api/spots?rvParkId=X&estado=Y
GET    /api/spots/:id
POST   /api/spots
PUT    /api/spots/:id
DELETE /api/spots/:id
PATCH  /api/spots/:id/estado
```

**Formato de Spot:**
```json
{
  "id": 1,
  "codigo": "A-01",
  "rvParkId": 1,
  "estado": "Disponible|Pagado|Trabajador|Caliche",
  "clienteNombre": "Juan Pérez",
  "clienteTelefono": "1234567890",
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-01-15"
}
```

#### Rentas, Pagos, Clientes

Endpoints similares siguiendo convenciones REST estándar.

### Configurar CORS en el Backend

Tu servidor Express necesita permitir peticiones desde el frontend:

```javascript
// En tu archivo principal de Express
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend en desarrollo
  credentials: true
}));

// Para producción:
// origin: 'https://tu-dominio.com'
```

### JWT en el Backend

El backend debe:
1. Generar un token JWT al hacer login
2. Verificar el token en cada petición protegida
3. Devolver 401 si el token es inválido (el frontend redirigirá al login)

Ejemplo de middleware de verificación:

```javascript
function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

## 🎨 Personalización

### Cambiar Colores del Sistema

Edita `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#3b82f6', // Azul para Caliche
    // ... más tonos
  },
  success: {
    500: '#10B981', // Verde para Pagado
  },
  warning: {
    500: '#F59E0B', // Naranja para Trabajador
  },
  neutral: {
    200: '#E5E7EB', // Gris para Disponible
  },
}
```

### Agregar Más RV Parks

Edita `src/utils/constants.js`:

```javascript
export const RV_PARKS = [
  { id: 1, nombre: 'Park 1 - Norte', codigo: 'P1' },
  { id: 2, nombre: 'Park 2 - Sur', codigo: 'P2' },
  // Agrega más aquí
];
```

### Reemplazar Íconos

Los íconos actuales son placeholders SVG. Para íconos profesionales:

1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube tu logo/ícono
3. Descarga todos los tamaños
4. Reemplaza los archivos en `public/icons/`

## 📱 Probar la PWA

### En Desktop (Chrome/Edge)

1. Abre `http://localhost:5173` (o la URL de producción)
2. En la barra de direcciones verás un ícono de instalación (⊕)
3. Click para instalar como aplicación standalone

### En Android (Chrome)

1. Abre la URL en Chrome
2. Menú (⋮) > "Agregar a pantalla de inicio"
3. La app se instalará como una aplicación nativa

### En iOS (Safari)

1. Abre la URL en Safari
2. Botón de compartir > "Agregar a inicio"
3. La app aparecerá en la pantalla de inicio

### Verificar Service Worker

1. Abre DevTools (F12)
2. Application > Service Workers
3. Deberías ver el Service Worker registrado y activo

### Probar Modo Offline

1. Inicia sesión y navega al Dashboard
2. Carga los espacios de un RV Park
3. DevTools > Network > Marca "Offline"
4. Recarga la página
5. Deberías ver los datos cacheados (último estado)

## 🚀 Deployment

### Opción 1: Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Opción 2: Netlify

```bash
npm run build
# Sube la carpeta dist/ a Netlify
```

### Opción 3: Servidor Propio

```bash
npm run build
# Copia la carpeta dist/ a tu servidor
# Sirve con nginx, apache, o cualquier servidor estático
```

Configuración de Nginx:

```nginx
server {
  listen 80;
  server_name tu-dominio.com;
  root /ruta/a/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Variables de Entorno en Producción

Crea un archivo `.env.production`:

```
VITE_API_BASE_URL=https://api.tu-dominio.com/api
```

Reconstruye para producción:

```bash
npm run build
```

## 📊 Análisis de Performance

### Lighthouse

1. Abre Chrome DevTools
2. Lighthouse tab
3. Selecciona "Progressive Web App"
4. "Generate report"

Deberías obtener:
- ✅ Installable
- ✅ PWA Optimized
- ✅ Service Worker Registered
- ✅ Manifest Valid

### Bundle Size

El proyecto construye en ~1.5 MB. Para optimizar:

1. Usa lazy loading en rutas:
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

2. Code splitting en componentes grandes

3. Analiza el bundle:
```bash
npm install -D rollup-plugin-visualizer
```

## 🐛 Troubleshooting

### Service Worker no se registra

- Verifica que estés en HTTPS o localhost
- Limpia cache: DevTools > Application > Clear storage
- Reconstruye: `npm run build`

### API no responde / CORS Error

- Verifica que el backend esté corriendo
- Verifica la URL en `.env`
- Configura CORS en el backend
- Revisa la consola del navegador

### Estilos no se aplican

- Verifica que Tailwind esté instalado: `npm list tailwindcss`
- Reconstruye: `npm run build`
- Limpia cache: `rm -rf node_modules/.vite`

### Build falla

```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Próximos Pasos

1. **Implementar Backend Completo**
   - Crear todos los endpoints necesarios
   - Configurar base de datos
   - Implementar JWT y autenticación

2. **Completar Módulos Frontend**
   - Rentas (CRUD completo)
   - Pagos (con historial)
   - Clientes (con búsqueda)
   - Reportes (con filtros avanzados)

3. **Mejorar PWA**
   - Notificaciones push
   - Background sync
   - Actualización automática

4. **Testing**
   - Unit tests con Jest
   - E2E tests con Cypress
   - Pruebas de integración

5. **Documentación**
   - Manual de usuario
   - Guía de administración
   - API documentation

## 📞 Contacto

Diego Ponce - Aplicaciones Web Progresivas
Universidad - 2025

---

**¡El proyecto está listo para desarrollo! 🎉**
