# 🚀 Tu Tiendita Digital

**Una plataforma completa de gestión de catálogos digitales para emprendedores latinoamericanos**

![Estado](https://img.shields.io/badge/Estado-Funcional%20con%20Problemas-yellow)
![Versión](https://img.shields.io/badge/Versión-1.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

## 🎯 Descripción

Tu Tiendita Digital democratiza el comercio digital para pequeños emprendedores, permitiendo crear catálogos profesionales sin conocimientos técnicos y facilitando la comunicación directa con clientes vía WhatsApp.

## ✨ Características Principales

- **🇪🇸 Interfaz en Español**: Diseñada específicamente para emprendedores latinoamericanos
- **📱 Mobile-First**: Optimizada para dispositivos móviles y tablets
- **🔐 Autenticación Segura**: Email/Password + Google OAuth + Smart Authentication
- **🚀 Onboarding Guiado**: Configuración paso a paso de tienda y WhatsApp
- **📦 Gestión Completa de Productos**: CRUD con múltiples imágenes y variantes
- **⚡ Tiempo Real**: Actualizaciones instantáneas con Supabase Realtime
- **🛒 Carrito Virtual**: Selección múltiple para envío por WhatsApp
- **📊 Analytics**: Métricas en tiempo real y control de inventario
- **🔗 WhatsApp Integration**: Comunicación directa con clientes
- **🌐 SEO Optimizado**: Catálogos públicos optimizados para buscadores

## 🏗️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS  
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Deployment**: Netlify
- **Icons**: Lucide React
- **State Management**: React Context + Custom Hooks
- **Real-time**: Supabase Realtime
- **Testing**: Vitest (No implementado)

## 🚨 Estado Actual del Proyecto

### ✅ Funcionalidades Completadas

- ✅ **Autenticación completa** (Email/Password + Google OAuth)
- ✅ **Onboarding wizard** con validación de store_slug
- ✅ **CRUD de productos** con múltiples imágenes
- ✅ **Sistema de variantes** (precio, stock, SKU)
- ✅ **Dashboard con métricas** y analytics en tiempo real
- ✅ **WhatsApp integration** para contacto directo
- ✅ **Mobile-first responsive design**
- ✅ **Row Level Security (RLS)** implementado

### ❌ Problemas Críticos Identificados

- ❌ **PublicCatalog.tsx** - Errores de compilación por imports duplicados
- ❌ **Testing suite** - 0% cobertura de tests  
- ❌ **Memory leaks** - En algunos componentes React
- ❌ **Performance issues** - Re-renders excesivos

### ⚠️ Características en Desarrollo

- ⚠️ **PWA features** - Service workers no implementados
- ⚠️ **Image optimization** - Sin compresión automática
- ⚠️ **Internationalization** - Solo español
- ⚠️ **Error boundaries** - Cobertura parcial

## 🔧 Comandos de Desarrollo

```bash
# Desarrollo (ÚNICO ENTORNO DE TESTING)
npm run dev          # Inicia servidor en http://localhost:5173
                     # ⚠️ TODAS las pruebas se realizan aquí desde la vista del usuario

# Build y Deploy (solo cuando se solicite explícitamente)
npm run build        # Construye para producción
npm run preview      # Preview del build

# Linting
npm run lint         # ESLint check
```

## 🧪 Metodología de Testing

- **Entorno Principal:** `http://localhost:5173`
- **Perspectiva:** Vista del usuario final
- **Internet:** Solo para casos muy urgentes
- **Modificaciones:** Solo con autorización explícita del desarrollador
- **Regla de Oro:** NO hacer acciones sin permiso

## 🌐 URLs del Proyecto

- **Desarrollo**: `http://localhost:5173` (ÚNICO ENTORNO DE TESTING)
- **Supabase**: `https://lwflptiltwnxjvfvtyrx.supabase.co`  
- **Dominio**: `https://tutiendita.digital`

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. In your Supabase dashboard, go to the SQL Editor and run the following commands to create the necessary tables:

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  store_slug TEXT UNIQUE,
  store_name TEXT,
  whatsapp_number TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for products table
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access for public catalogs
CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public can view user profiles" ON users
  FOR SELECT USING (true);
```

3. Create a storage bucket for product images:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `products`
   - Make it public
   - Set up the following storage policy:

```sql
-- Storage policy for product images
CREATE POLICY "Users can upload own product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);
```

4. Get your project credentials:
   - Go to Settings > API
   - Copy your Project URL and anon public key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd catalog-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### For Store Owners

1. **Sign Up**: Create an account with your email and password
2. **Onboarding**: 
   - Choose a unique store URL slug (e.g., `dulces-maria`)
   - Enter your WhatsApp number with country code
3. **Add Products**: Upload images, add descriptions and prices
4. **Manage Availability**: Toggle product availability on/off
5. **Share Catalog**: Share your public catalog URL with customers

### For Customers

- Visit public catalog URLs: `yoursite.com/store/store-slug`
- Browse available products
- Click "Pedir por WhatsApp" to contact the store owner directly

## Key Features Implementation

### Availability Toggle
Each product has a toggle switch that:
- Updates the product's `is_available` status in real-time
- Shows/hides products on the public catalog
- Applies visual filters (grayscale) to unavailable products

### WhatsApp Integration
- Generates dynamic WhatsApp URLs with pre-filled messages
- Format: `https://wa.me/[phone_number]?text=[encoded_message]`
- Includes the specific product name in the message

### Mobile-First Design
- Responsive grid layouts
- Touch-friendly controls and buttons
- Optimized for mobile viewport sizes
- Fast loading with image optimization

## Project Structure

```
src/
├── components/
│   ├── Auth/                 # Authentication forms
│   ├── Dashboard/            # Admin dashboard
│   ├── Onboarding/          # Setup wizard
│   ├── Products/            # Product management
│   ├── PublicCatalog/       # Public catalog view
│   └── Layout.tsx           # Common layout component
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   └── supabase.ts         # Supabase configuration
└── App.tsx                 # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact [your-email@example.com] or create an issue in the repository.