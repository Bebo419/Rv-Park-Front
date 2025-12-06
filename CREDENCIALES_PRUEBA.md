# Credenciales de Prueba

## ⚠️ Problema Actual

El frontend ahora está conectado correctamente al backend en Render, pero necesitas credenciales válidas para iniciar sesión.

## 🔧 Corrección Aplicada

Se corrigió el campo de login:
- ❌ Antes: `username` 
- ✅ Ahora: `nombre_usuario` (coincide con el backend)

## 🔐 Usuarios Disponibles

El backend en Render tiene 7 clientes registrados. Para iniciar sesión necesitas:

1. Un usuario con rol **"Administrador"**, **"Supervisor"** u **"Operador"**
2. Las credenciales correctas (nombre_usuario y password)

### Usuarios existentes encontrados:

Los usuarios en el sistema son:
- `preuba` (Cliente)
- `android` (Cliente) 
- `alonso` (Cliente)
- etc.

**Nota:** Todos los usuarios encontrados tienen rol "Cliente", por lo que podrían no tener acceso completo al sistema.

## 🚨 Necesitas Crear un Usuario Administrador

Si no tienes un usuario administrador, necesitas crearlo directamente en la base de datos o mediante una ruta de registro de administradores en el backend.

### Opción 1: Usar el backend local

Si tienes el backend corriendo localmente:

1. Cambia `.env.local` a:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

2. Reinicia el frontend:
   ```bash
   npm run dev
   ```

3. Crea un usuario administrador desde tu backend local

4. Sincroniza con la base de datos de producción

### Opción 2: Crear usuario via SQL (si tienes acceso)

Si tienes acceso directo a la base de datos en Render:

```sql
-- Insertar una persona
INSERT INTO Persona (nombre, email, telefono) 
VALUES ('Admin Sistema', 'admin@rvpark.com', '0000000000');

-- Obtener el id_Persona insertado (por ejemplo, 8)

-- Insertar el usuario administrador
INSERT INTO Usuario (id_Persona, nombre_usuario, password_hash, rol, activo) 
VALUES (8, 'admin', '$2b$10$hashedPasswordAqui', 'Administrador', 1);
```

**Nota:** La contraseña debe estar hasheada con bcrypt. Para generar el hash:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('tuPassword', 10).then(hash => console.log(hash));
```

### Opción 3: Endpoint de registro de admin

Si el backend tiene un endpoint especial para crear el primer administrador (por ejemplo `/api/auth/setup`), úsalo:

```bash
curl -X POST https://rv-park-backend.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin Sistema",
    "email": "admin@rvpark.com",
    "nombre_usuario": "admin",
    "password": "Admin123!",
    "rol": "Administrador"
  }'
```

## 🧪 Probar Login

Una vez que tengas credenciales válidas, prueba:

```bash
curl -X POST https://rv-park-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre_usuario":"TU_USUARIO","password":"TU_PASSWORD"}'
```

Respuesta esperada si es exitoso:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_aqui",
    "id_usuario": 1,
    "nombre_usuario": "admin",
    "rol": "Administrador",
    ...
  }
}
```

## 📝 Usuarios de Prueba Comunes

Si el backend tiene seed data, estos suelen ser los usuarios por defecto:

```
Usuario: admin
Password: admin123

Usuario: supervisor
Password: super123

Usuario: operador
Password: oper123
```

## ⚡ Quick Fix

Si estás en desarrollo y solo necesitas probar:

1. Usa uno de los usuarios "Cliente" existentes para hacer login:
   ```
   Usuario: preuba
   Password: (necesitas saber la password)
   ```

2. Una vez dentro, verifica si puedes crear usuarios desde el frontend (módulo Clientes)

## 🔍 Debug del Error 500

Para ver exactamente qué está causando el error 500:

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Network"
3. Intenta hacer login
4. Haz clic en la petición POST a `/api/auth/login`
5. Revisa:
   - **Request Payload**: Debe mostrar `{"nombre_usuario":"...","password":"..."}`
   - **Response**: Verás el error exacto del servidor

## 📞 Contacto con Backend

Si necesitas ayuda para crear un usuario administrador en el backend de Render, contacta al administrador del backend o revisa la documentación del backend.

## ✅ Verificación

El frontend está correctamente configurado y funcionando. El error 500 es porque:
- Las credenciales no existen
- El password es incorrecto
- El usuario no está activo
- O hay un error en el servidor (poco probable ya que el endpoint responde)
