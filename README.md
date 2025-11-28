# 🚐 RV Park Manager - Progressive Web App

Sistema de Gestión de RV Parks desarrollado como Progressive Web App (PWA) con React, Vite, Tailwind CSS y soporte offline completo.

## ✨ Características Principales

### 🎨 Diseño y UX
- **Interfaz moderna y responsive** con Tailwind CSS
- **Panel visual de espacios** tipo mapa de estacionamiento interactivo
- **Sistema de colores personalizado** por estado de espacio:
  - ✅ Verde (#10B981): Pagado
  - 🟠 Naranja (#F59E0B): Trabajador
  - ⬜ Gris (#E5E7EB): Disponible
  - 🔵 Azul (#3B82F6): Trailer de caliche
- **Animaciones suaves** y transiciones fluidas
- **Tooltips informativos** al hacer hover sobre espacios

### 🔐 Autenticación y Roles
- Login con JWT
- Rutas protegidas por autenticación
- Soporte para 3 roles (Administrador, Supervisor, Operador)
- Contexto global de autenticación con React Context

### 📱 Progressive Web App
- **Instalable** en dispositivos móviles y desktop
- **Service Worker** registrado automáticamente
- **Soporte offline parcial**: páginas estáticas y último estado del dashboard
- **Manifest.json** configurado con múltiples tamaños de íconos
- **Optimizado para Lighthouse** (instalable, manifesto válido)

### 🛠️ Módulos Funcionales
- **Dashboard**: Mapa visual de espacios en tiempo real
- **Gestión de Spots**: CRUD completo de espacios
- **Rentas**: Administración de rentas con cálculo proporcional
- **Pagos**: Registro y seguimiento de pagos
- **Clientes**: Base de datos de clientes
- **Reportes**: Exportación a PDF, Excel y CSV

## 🚀 Tecnologías

- React 18 + Vite
- React Router DOM v6
- Tailwind CSS + PostCSS
- axios (con interceptores JWT)
- react-toastify
- date-fns
- xlsx, jspdf, jspdf-autotable
- react-icons
- vite-plugin-pwa + workbox

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu URL de API

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🧪 Probar la PWA

### Instalación Desktop (Chrome/Edge)
1. Abre `http://localhost:5173`
2. Click en el ícono de instalación en la barra de direcciones (⊕)
3. Click en "Instalar"

### Instalación Mobile (Android/iOS)
1. Abre la app en Chrome (Android) o Safari (iOS)
2. Android: Menú > "Agregar a pantalla de inicio"
3. iOS: Compartir > "Agregar a inicio"

### Probar Offline
1. Abre la app e inicia sesión
2. Carga el Dashboard
3. DevTools > Network > Activar "Offline"
4. Recarga - debería mostrar datos cacheados

## 📁 Estructura

```
src/
├── components/     # Componentes reutilizables
├── contexts/       # React Contexts (Auth)
├── pages/          # Páginas principales
├── services/       # Servicios API con axios
├── utils/          # Utilidades y constantes
├── App.jsx         # Routing
├── main.jsx
└── index.css       # Tailwind
```

## 🔧 Configuración

### API Backend
La app consume una API REST. Configura la URL en `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

Endpoints esperados:
- `POST /api/auth/login`
- `GET /api/spots?rvParkId=X&estado=Y`
- `POST /api/spots`, etc.

### Modificar Colores
Edita `tailwind.config.js` para personalizar el sistema de colores.

## 📄 Licencia

Proyecto académico - Universidad

## 👨‍💻 Autores

Diego Ponce, Luis García, Alonso Villaseñor - Aplicaciones Web Progresivas


---

Para más detalles, consulta los comentarios en el código o la documentación de las tecnologías utilizadas.
