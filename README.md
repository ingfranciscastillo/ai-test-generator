# AI Test Generator

Una aplicación web construida con Next.js que permite a usuarios autenticados generar tests automáticamente para su código usando inteligencia artificial (Claude API).

## 🚀 Características

- **Autenticación completa** con Clerk
- **Pagos integrados** con Stripe (plan básico y premium)
- **Generación de tests con IA** usando Claude (Anthropic API)
- **Múltiples lenguajes** soportados (JavaScript, TypeScript, Python, Java, C#, Go)
- **Sistema de límites** por plan de suscripción
- **UI moderna** con Tailwind CSS y ShadCN
- **Logs de uso** para tracking de generaciones

## 📋 Requisitos Previos

- Node.js 18+
- Una cuenta en [Clerk](https://clerk.com)
- Una cuenta en [Stripe](https://stripe.com)
- Una API key de [Anthropic Claude](https://console.anthropic.com)

## 🛠 Instalación

1. **Clonar el repositorio**

```bash
git clone <tu-repo>
cd ai-test-generator
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Ejecutar en desarrollo**

```bash
bun run dev
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración de Servicios

### Clerk (Autenticación)

1. Crea una aplicación en [Clerk Dashboard](https://dashboard.clerk.com)
2. Configura los métodos de autenticación que prefieras
3. Copia las API keys al archivo `.env.local`

### Stripe (Pagos)

1. Crea una cuenta en [Stripe Dashboard](https://dashboard.stripe.com)
2. Crea un producto "Premium Plan" con precio recurrente mensual
3. Copia el Price ID y actualiza `PREMIUM_PRICE_ID` en:
   - `app/api/create-checkout/route.ts`
   - `components/PricingModal.tsx`
4. Configura un webhook endpoint apuntando a `/api/webhooks/stripe`
5. Escucha estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### Anthropic Claude

1. Crea una cuenta en [Anthropic Console](https://console.anthropic.com)
2. Genera una API key
3. Cópiala al archivo `.env.local`

## 🏗 Estructura del Proyecto

```
├── app/
│   ├── (auth)/           # Páginas de autenticación
│   ├── actions/          # Server Actions
│   ├── api/              # API Routes
│   ├── dashboard/        # Dashboard principal
│   └── globals.css       # Estilos globales
├── components/
│   ├── ui/               # Componentes base UI
│   ├── TestGenerator.tsx # Generador principal
│   ├── UserNav.tsx       # Navegación usuario
│   └── PricingModal.tsx  # Modal de pricing
├── lib/
│   ├── subscription.ts   # Lógica de suscripciones
│   ├── usage-logs.ts     # Sistema de logs
│   └── utils.ts          # Utilidades
└── hooks/
    └── use-toast.ts      # Hook para notificaciones
```

## 🔧 Funcionalidades Principales

### Sistema de Límites

- **Plan Básico**: 3 generaciones por mes
- **Plan Premium**: Generaciones ilimitadas

### Lenguajes Soportados

- JavaScript (Jest, Mocha, Vitest)
- TypeScript (Jest, Vitest)
- Python (pytest, unittest)
- Java (JUnit)
- C# (NUnit, xUnit)
- Go (testing package)

### Prompt para Claude

El sistema usa un prompt estructurado que:

- Analiza el código de entrada
- Identifica el lenguaje y framework apropiado
- Genera tests completos con casos edge
- Incluye validaciones y manejo de errores

## 📊 Base de Datos (Simulada)

**⚠️ Importante**: Esta implementación usa almacenamiento en memoria para simplicidad. Para producción, debes implementar una base de datos real (PostgreSQL, MongoDB, etc.) para:

- Estados de suscripción de usuarios
- Logs de uso y generaciones
- Histórial de tests generados

### Tablas Recomendadas para Producción

```sql
-- Usuarios y suscripciones
CREATE TABLE user_subscriptions (
  user_id VARCHAR PRIMARY KEY,
  is_premium BOOLEAN DEFAULT FALSE,
  generations_used INTEGER DEFAULT 0,
  max_generations INTEGER DEFAULT 3,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  reset_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Logs de uso
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  language VARCHAR NOT NULL,
  code_length INTEGER,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Variables de Entorno para Producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de despliegue y actualizar las URLs:

```env
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## 🔐 Seguridad

- ✅ Autenticación requerida para todas las funciones
- ✅ Validación de suscripción en el servidor
- ✅ Rate limiting por plan de usuario
- ✅ Webhooks seguros con Stripe
- ✅ Validación de entrada para prevenir injection

## 📝 Personalización

### Modificar Límites de Generación

Edita en `lib/subscription.ts`:

```typescript
maxGenerations: 3, // Cambiar límite plan básico
```

### Agregar Nuevos Lenguajes

1. Actualiza `SUPPORTED_LANGUAGES` en `components/TestGenerator.tsx`
2. Modifica el prompt en `app/actions/generate-test.ts`
3. Ajusta la lógica de extensiones de archivo

### Personalizar UI

Los componentes UI están en `components/ui/` y usan Tailwind CSS. Puedes:

- Cambiar colores en `tailwind.config.ts`
- Modificar estilos en `app/globals.css`
- Personalizar componentes individuales

## 🐛 Solución de Problemas

### Error "No autorizado"

- Verifica que las API keys de Clerk estén correctas
- Asegúrate de que el middleware esté configurado

### Tests no se generan

- Verifica la API key de Anthropic
- Revisa los logs del servidor para errores específicos
- Confirma que el usuario no haya excedido límites

### Pagos no funcionan

- Verifica webhook de Stripe esté configurado
- Revisa que el Price ID sea correcto
- Confirma que los eventos de webhook estén habilitados

## 📞 Soporte

Para reportar bugs o solicitar características:

1. Abre un issue en GitHub
2. Incluye logs relevantes
3. Describe pasos para reproducir el problema

## 🔄 Próximas Características

- [ ] Histórial de tests generados
- [ ] Exportación en lote
- [ ] Más frameworks de testing
- [ ] Tests de integración automáticos
- [ ] Dashboard de analytics
- [ ] API pública

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.
