# 🚀 Quick Start - RV Park Manager PWA

## Inicio Rápido (5 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
```bash
# El archivo .env ya está creado con valores por defecto
# Si necesitas cambiar la URL del API:
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
```

### 3. Ejecutar en Desarrollo
```bash
npm run dev
```

Abre **http://localhost:5173** en tu navegador.

### 4. Login de Prueba
```
Usuario: admin
Contraseña: admin123
```

*(Nota: Estos son valores de demostración. El login real depende de tu backend)*

---

## Verificar PWA

### Chrome DevTools
1. F12 → Application → Manifest
2. Verifica que aparezca "RV Park Manager"
3. Application → Service Workers
4. Verifica que esté registrado y activo

### Instalar App
1. Click en el ícono ⊕ en la barra de direcciones
2. "Instalar RV Park Manager"
3. La app se abre como ventana standalone

---

## Construir para Producción

```bash
npm run build
npm run preview
```

Los archivos optimizados están en `dist/`

---

## Estructura de Archivos Clave

```
src/
├── App.jsx          # Router principal
├── pages/
│   └── Dashboard.jsx  # Panel visual de espacios
├── components/
│   ├── Layout.jsx     # Sidebar + navegación
│   └── SpotCard.jsx   # Tarjeta de espacio
└── services/
    └── api.js         # Axios con JWT
```

---

## Próximos Pasos

1. **Conectar Backend**
   - Actualiza `.env` con tu URL de API
   - Asegúrate que CORS esté configurado
   - Verifica endpoints de autenticación

2. **Personalizar**
   - Colores: `tailwind.config.js`
   - RV Parks: `src/utils/constants.js`
   - Íconos: `public/icons/`

3. **Desplegar**
   - Vercel: `npm i -g vercel && vercel`
   - Netlify: Sube carpeta `dist/`

---

## Comandos Útiles

```bash
# Limpiar y reinstalar
rm -rf node_modules dist
npm install

# Ver estructura del proyecto
tree -L 2 src/

# Analizar bundle size
npm run build -- --mode=production

# Verificar que todo funciona
npm run dev
```

---

## Soporte

- **README.md**: Documentación completa
- **SETUP.md**: Guía de integración con backend
- **PROJECT_SUMMARY.md**: Resumen del proyecto

---

**¡Listo para desarrollar! 🎉**
