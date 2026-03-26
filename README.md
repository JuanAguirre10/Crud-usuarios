# CRUD Usuarios

API REST + interfaz web para gestión de usuarios. Desarrollado con Node.js, Express y PostgreSQL (Supabase).

## Stack

- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL vía Supabase
- **Frontend:** HTML + CSS + JS vanilla (incluido en `/public`)
- **Deploy:** Render

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Listar todos |
| GET | `/api/usuarios/:id` | Obtener uno |
| POST | `/api/usuarios` | Crear |
| PUT | `/api/usuarios/:id` | Actualizar |
| DELETE | `/api/usuarios/:id` | Eliminar |

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
PORT=3000
```

## Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`

## Base de datos

Ejecuta `supabase.sql` en el **SQL Editor** de tu proyecto Supabase para crear la tabla e insertar datos de prueba.

## Deploy en Render

1. Sube el proyecto a GitHub
2. En Render: **New → Web Service** → conecta el repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Agrega la variable `DATABASE_URL` en Environment Variables
