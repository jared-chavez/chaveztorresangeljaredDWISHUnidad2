# CRUD 31 Minutos

Una aplicación full-stack para gestión de noticias construida con React, TypeScript, Node.js, Express y PostgreSQL. El sistema permite crear, editar, eliminar y visualizar noticias con soporte completo para imágenes, búsqueda avanzada y paginación, ideal para medios de comunicación, blogs corporativos o cualquier plataforma que requiera gestión de contenido editorial.

## 🚀 Características

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL
- **Gestión de imágenes**: Upload y almacenamiento de imágenes
- **CRUD completo**: Crear, leer, actualizar y eliminar noticias
- **Búsqueda y paginación**: Filtros y navegación por páginas
- **Docker**: Configuración con Docker Compose

## 📁 Estructura del Proyecto

```
crud-31-minutos/
├── api/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Controladores de la API
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas de la API
│   │   ├── middleware/     # Middleware personalizado
│   │   └── config/         # Configuración de base de datos
│   ├── migrations/         # Migraciones de base de datos
│   └── dist/              # Código compilado
├── api-client/            # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios de API
│   │   └── components/    # Componentes React
│   └── dist/             # Build del frontend
├── docker-compose.yml     # Configuración de Docker
└── package.json          # Scripts y dependencias
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación
- **React Hot Toast** - Notificaciones

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **PostgreSQL** - Base de datos relacional
- **Multer** - Manejo de archivos
- **CORS** - Configuración de CORS

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js >= 18
- Docker y Docker Compose
- Git

### Instalación Rápida

```bash
# Clonar el repositorio
git clone <repository-url>
cd crud-31-minutos

# Instalación completa (instala dependencias, levanta Docker y ejecuta migraciones)
npm run setup
```

### Instalación Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar la base de datos con Docker
npm run docker:up

# 3. Ejecutar migraciones
npm run db:migrate

# 4. Iniciar el desarrollo
npm run dev
```

## 📜 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Inicia frontend y backend en paralelo
npm run dev:api      # Solo backend (puerto 3002)
npm run dev:client   # Solo frontend (puerto 5174)
```

### Producción
```bash
npm run build        # Construye ambos proyectos
npm run build:api    # Solo backend
npm run build:client # Solo frontend
npm run start:api    # Inicia el backend en producción
```

### Docker
```bash
npm run docker:up    # Levanta los contenedores
npm run docker:down  # Detiene los contenedores
```

### Base de Datos
```bash
npm run db:migrate   # Ejecuta las migraciones
```

### Utilidades
```bash
npm run clean        # Limpia node_modules
npm run fresh        # Limpia e instala todo desde cero
```

## 🗄️ Base de Datos

### Estructura de la Tabla `news`
```sql
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  image_data BYTEA,
  image_mime TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
POSTGRES_DB=crud31
POSTGRES_USER=cruduser
POSTGRES_PASSWORD=crudpass

# API
PORT=3002
VITE_API_BASE_URL=http://localhost:3002
```

## 🔌 API Endpoints

### Noticias
- `GET /api/news` - Listar noticias (con paginación y búsqueda)
- `GET /api/news/:id` - Obtener noticia por ID
- `POST /api/news` - Crear nueva noticia
- `PUT /api/news/:id` - Actualizar noticia
- `DELETE /api/news/:id` - Eliminar noticia

### Imágenes
- `GET /api/news/:id/image` - Obtener imagen de noticia
- `PUT /api/news/:id/image` - Actualizar imagen
- `DELETE /api/news/:id/image` - Eliminar imagen

### Salud
- `GET /health` - Health check

## 🎨 Funcionalidades del Frontend

- **Dashboard**: Lista de noticias con búsqueda y paginación
- **Formulario**: Crear y editar noticias
- **Gestión de imágenes**: Upload, preview y eliminación
- **Navegación**: Sidebar con navegación intuitiva
- **Responsive**: Diseño adaptable a diferentes pantallas

## 🐳 Docker

El proyecto incluye configuración de Docker Compose para PostgreSQL:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: crud31
      POSTGRES_USER: cruduser
      POSTGRES_PASSWORD: crudpass
    ports:
      - "5432:5432"
```

## 🔧 Configuración de Desarrollo

### Backend (API)
- Puerto: 3002
- Hot reload con ts-node-dev
- CORS habilitado
- Límite de upload: 10MB

### Frontend (Client)
- Puerto: 5174
- Proxy configurado para API
- Hot reload con Vite
- Variables de entorno desde raíz del proyecto

## 📝 Notas de Desarrollo

- Las imágenes se almacenan como BYTEA en PostgreSQL
- Soporte para formatos: PNG, JPEG, WEBP
- Paginación implementada en el backend
- Búsqueda por título y contenido
- Timestamps automáticos (created_at, updated_at)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
