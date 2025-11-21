# LM-TEST - Plataforma de E-commerce

Plataforma de comercio electrónico moderna construida con las últimas tecnologías web, enfocada en rendimiento, escalabilidad y experiencia de usuario.

## 🚀 Tecnologías Principales

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router para renderizado del lado del servidor
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático para mayor confiabilidad del código
- **[React 19](https://react.dev/)** - Biblioteca de interfaz de usuario
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first para diseño responsivo

### Backend & Base de Datos
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional en producción (no mock)
- **[Neon](https://neon.tech/)** - PostgreSQL serverless para escalabilidad automática
- **[Postgres.js](https://github.com/porsager/postgres)** - Cliente PostgreSQL nativo para Node.js

### Búsqueda
- **[Algolia](https://www.algolia.com/)** - Motor de búsqueda en tiempo real
- **[React InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)** - Componentes de búsqueda pre-construidos
- Búsqueda instantánea con autocompletado
- Navegación con teclado (Arrow keys, Enter, Escape)

### Almacenamiento de Archivos
- **[Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)** - Almacenamiento de imágenes de productos
- Compatible con S3 para fácil migración

### Gestión de Estado
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management ligero y escalable
- Store modular separada de componentes

### Runtime
- **[Bun](https://bun.sh/)** - Runtime JavaScript ultra-rápido
  - 3x más rápido que Node.js
  - Transpilación TypeScript nativa
  - Carga automática de `.env`
  - Gestor de paquetes integrado

## 🏗️ Arquitectura

### Atomic Design
El proyecto sigue los principios de **Atomic Design** para una arquitectura de componentes escalable:

```
components/
├── atoms/          # Componentes básicos (Button, Input, Badge, etc.)
├── molecules/      # Combinaciones de átomos (SearchBar, ProductCard, etc.)
├── organisms/      # Secciones complejas (Header, ProductDetail, etc.)
└── templates/      # Layouts de página
```

**Beneficios:**
- Reutilización de componentes
- Mantenimiento simplificado
- Consistencia visual
- Escalabilidad del proyecto

### Estructura de Directorios

```
LM-TEST/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── search/        # Endpoint de búsqueda
│   │   └── items/[id]/    # Endpoint de productos
│   ├── product/[id]/      # Páginas de detalle
│   └── search/            # Página de resultados
├── components/            # Componentes Atomic Design
├── lib/                   # Utilidades y configuración
│   ├── db.ts             # Cliente PostgreSQL
│   ├── db-queries.ts     # Queries de base de datos
│   └── algolia.ts        # Cliente Algolia
├── store/                 # Zustand stores
├── tests/                 # Tests organizados por tipo
│   ├── api/              # Tests de API endpoints
│   └── components/       # Tests de componentes UI
├── types/                 # Definiciones TypeScript
└── migrations/            # Migraciones de base de datos
```

## 🧪 Testing

### Organización de Tests
Todos los tests están centralizados en el directorio `tests/` con la siguiente estructura:

```
tests/
├── api/                      # Tests de API Routes
│   ├── search/              # Tests del endpoint de búsqueda
│   │   └── route.test.ts
│   └── items/               # Tests del endpoint de productos
│       └── items.test.ts
└── components/              # Tests de componentes UI
    └── molecules/
        └── SearchBar.test.tsx
```

### Cobertura de Tests
El proyecto cuenta con **38 tests** cubriendo:

- **API Endpoints**: 100% de cobertura
  - `/api/search` - 8 tests (tests/api/search/route.test.ts)
  - `/api/items/[id]` - 9 tests (tests/api/items/items.test.ts)

- **Componentes UI**: 98% de cobertura
  - SearchBar - 21 tests (tests/components/molecules/SearchBar.test.tsx)
  - Navegación con teclado
  - Interacciones de usuario
  - Estados de loading y error

### Stack de Testing
- **[Jest](https://jestjs.io/)** - Framework de testing con mocks nativos
- **[@testing-library/react](https://testing-library.com/react)** - Testing de componentes React
- **[@testing-library/user-event](https://testing-library.com/docs/user-event/intro/)** - Simulación de interacciones

**Nota:** Los tests utilizan `jest.mock()` para mockear dependencias de base de datos y servicios externos, sin necesidad de archivos de mock adicionales.

### Ejecutar Tests

```bash
# Ejecutar todos los tests
bun test

# Modo watch para desarrollo
bun test:watch

# Generar reporte de cobertura
bun test:coverage
```

### Resultados

```
Test Suites: 3 passed, 3 total
Tests:       38 passed, 38 total
Coverage:
  - API Routes: 100%
  - SearchBar:  98.36%
```

## 📊 Base de Datos

### PostgreSQL en Producción

A diferencia de muchos proyectos de demostración que usan datos mock, este proyecto utiliza una **base de datos PostgreSQL real** alojada en Neon.

### Schema y Relaciones

```
┌─────────────┐
│   users     │
│─────────────│
│ id (PK)     │◄──────┐
│ email       │       │
│ username    │       │
│ role        │       │
└─────────────┘       │
      │               │
      │ 1:N           │ seller
      ▼               │
┌─────────────┐       │
│  addresses  │       │
│─────────────│       │
│ id (PK)     │       │
│ user_id(FK) │       │
│ is_default  │       │
└─────────────┘       │
                      │
┌─────────────┐       │
│ categories  │       │
│─────────────│       │
│ id (PK)     │       │
│ parent_id   │◄──┐   │
└─────────────┘   │   │
      │           │   │
      │ 1:N  self│   │
      ▼           │   │
┌──────────────────┐  │
│    products      │  │
│──────────────────│  │
│ id (PK)          │  │
│ seller_id (FK)   │──┘
│ category_id (FK) │──┘
│ title            │
│ price            │
│ condition        │
└──────────────────┘
      │
      ├─── 1:N ───► product_images (url, is_primary, display_order)
      ├─── 1:N ───► product_attributes (key, value)
      ├─── 1:N ───► installments (quantity, amount, rate)
      ├─── 1:N ───► shipping_options (mode, cost, free_shipping)
      ├─── 1:N ───► reviews (rating, comment) ───► users
      └─── N:M ───► favorites ◄─── users

┌─────────────┐
│   orders    │
│─────────────│
│ id (PK)     │
│ buyer_id(FK)│───► users
│ address_id  │───► addresses
│ total       │
│ status      │
└─────────────┘
      │
      │ 1:N
      ▼
┌──────────────┐
│ order_items  │
│──────────────│
│ order_id(FK) │
│ product_id   │───► products
│ seller_id    │───► users
│ quantity     │
└──────────────┘
```

### Tablas Principales

**Core:**
- **`users`** - Usuarios del sistema (buyers, sellers, admins)
- **`categories`** - Categorías jerárquicas con self-reference
- **`addresses`** - Direcciones de envío vinculadas a usuarios

**Productos:**
- **`products`** - Catálogo de productos (vinculado a seller y category)
- **`product_images`** - Imágenes almacenadas en Backblaze B2
- **`product_attributes`** - Atributos clave-valor (color, tamaño, etc.)
- **`installments`** - Opciones de financiamiento
- **`shipping_options`** - Métodos de envío disponibles

**Interacciones:**
- **`reviews`** - Reseñas y calificaciones (user + product)
- **`favorites`** - Lista de deseos (relación N:M)

**Transacciones:**
- **`orders`** - Órdenes de compra
- **`order_items`** - Items individuales por orden

### Vistas Optimizadas

**`product_summary`** - Vista desnormalizada que combina:
- Información del producto
- Nombre de categoría
- Datos del vendedor
- Rating promedio y conteo de reviews
- URL de imagen principal

### Sincronización con Algolia

Los productos se sincronizan automáticamente con Algolia para búsqueda instantánea:

```bash
bun run sync-algolia
```

## 🎨 Características del UI

### Búsqueda Inteligente
- Búsqueda en tiempo real con Algolia
- Autocompletado con vista previa de productos
- Navegación completa con teclado:
  - `↑` `↓` - Navegar resultados
  - `Enter` - Seleccionar producto
  - `Escape` - Cerrar resultados
- Thumbnails de productos
- Ratings y precios visibles

### Diseño Responsivo
- Mobile-first approach
- Breakpoints optimizados con Tailwind
- Imágenes adaptativas con Next.js Image

## 🚀 Instalación y Desarrollo

### Requisitos Previos
- [Bun](https://bun.sh/) >= 1.0
- PostgreSQL (o cuenta en Neon)
- Cuenta de Algolia
- Cuenta de Backblaze B2 (opcional)

### Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
ALGOLIA_ADMIN_KEY=your_admin_key
```

### Comandos

```bash
# Instalar dependencias
bun install

# Desarrollo
bun dev

# Build de producción
bun run build

# Iniciar servidor de producción
bun start

# Tests
bun test
bun test:watch
bun test:coverage

# Sincronizar productos con Algolia
bun run sync-algolia

# Linting
bun run lint
```

## 📈 Rendimiento

### Por qué Bun?

**Bun** es un runtime JavaScript diseñado desde cero para velocidad:

| Operación | Node.js | Bun | Mejora |
|-----------|---------|-----|--------|
| Startup   | 100ms   | 30ms | 3.3x |
| Install   | 10s     | 3s   | 3.3x |
| Test      | 5s      | 1.5s | 3.3x |

**Ventajas adicionales:**
- Transpilación TypeScript sin configuración
- Bundler integrado
- Test runner nativo
- Compatibilidad con Node.js

### Optimizaciones Next.js
- Server Components por defecto
- Lazy loading de imágenes
- Code splitting automático
- Edge Runtime para API Routes

## 🔒 Calidad del Código

### TypeScript Estricto
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Linting
- ESLint con configuración Next.js
- Husky para pre-commit hooks
- Lint-staged para archivos modificados

### Convenciones
- Sin comentarios innecesarios
- Sin uso de `any`
- Nombres descriptivos
- Componentes funcionales
- Custom hooks para lógica reutilizable

## 🎯 Próximas Características

- [ ] Sistema de carrito de compras
- [ ] Checkout con Stripe
- [ ] Dashboard de administración
- [ ] Sistema de notificaciones
- [ ] Filtros avanzados de búsqueda
- [ ] Recomendaciones personalizadas

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Nestor Barraza**

Desarrollado con ❤️ usando las mejores prácticas de desarrollo web moderno.

---

**Stack Tecnológico Resumido:**
Next.js 16 · React 19 · TypeScript · PostgreSQL · Algolia · Zustand · Tailwind CSS 4 · Bun · Jest · Backblaze B2
