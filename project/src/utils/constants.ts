// FIXED: Centralized constants for better maintainability

export const APP_CONFIG = {
  NAME: 'Tu Tiendita Digital',
  VERSION: '1.0.0',
  DESCRIPTION: 'Crea y gestiona tu catálogo de productos con integración a WhatsApp',
  AUTHOR: 'ROFF Studio',
  WEBSITE: 'https://www.roffstudio.com/',
} as const;

export const VALIDATION_LIMITS = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  STORE_NAME_MIN_LENGTH: 2,
  STORE_NAME_MAX_LENGTH: 100,
  STORE_SLUG_MIN_LENGTH: 3,
  STORE_SLUG_MAX_LENGTH: 50,
  WHATSAPP_MIN_DIGITS: 10,
  WHATSAPP_MAX_DIGITS: 15,
  PRODUCT_NAME_MIN_LENGTH: 2,
  PRODUCT_NAME_MAX_LENGTH: 100,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 500,
  PRODUCT_CATEGORY_MAX_LENGTH: 50,
  SKU_MIN_LENGTH: 3,
  SKU_MAX_LENGTH: 50,
  PRICE_MAX_VALUE: 999999999,
  STOCK_MAX_VALUE: 999999,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 5,
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  STORE_SLUG: /^[a-z0-9\-_]+$/,
  SKU: /^[A-Z0-9\-_]+$/,
  WHATSAPP: /^\d+$/,
  DIGITS_ONLY: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
  TIMEOUT_ERROR: 'Tiempo de espera agotado. Intenta nuevamente.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error del servidor. Intenta nuevamente más tarde.',
  VALIDATION_ERROR: 'Por favor corrige los errores en el formulario.',
  DUPLICATE_ERROR: 'Ya existe un registro con estos datos.',
  REQUIRED_FIELD: 'Este campo es requerido.',
  INVALID_FORMAT: 'El formato ingresado no es válido.',
  FILE_TOO_LARGE: 'El archivo es demasiado grande.',
  UNSUPPORTED_FILE_TYPE: 'Tipo de archivo no soportado.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada exitosamente',
  REGISTER_SUCCESS: 'Cuenta creada exitosamente',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  PRODUCT_CREATED: 'Producto creado exitosamente',
  PRODUCT_UPDATED: 'Producto actualizado exitosamente',
  PRODUCT_DELETED: 'Producto eliminado exitosamente',
  IMAGE_UPLOADED: 'Imagen subida exitosamente',
  SETTINGS_SAVED: 'Configuración guardada exitosamente',
} as const;

export const LOADING_MESSAGES = {
  INITIALIZING: 'Inicializando aplicación...',
  LOADING_PROFILE: 'Cargando perfil...',
  LOADING_PRODUCTS: 'Cargando productos...',
  SAVING: 'Guardando...',
  UPLOADING: 'Subiendo archivo...',
  DELETING: 'Eliminando...',
  PROCESSING: 'Procesando...',
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
  STORE: '/store/:slug',
} as const;

export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  VIEW_MODE: 'dashboard_view_mode',
  SELECTED_CATEGORY: 'dashboard_selected_category',
} as const;

export const API_ENDPOINTS = {
  USERS: 'users',
  PRODUCTS: 'products',
  PRODUCT_IMAGES: 'product_images',
  PRODUCT_VARIANTS: 'product_variants',
} as const;

export const SUPABASE_CONFIG = {
  STORAGE_BUCKET: 'products',
  REALTIME_CHANNEL_PREFIX: 'products-',
  AUTH_REDIRECT_PATH: '/auth',
} as const;

export const IMAGE_CONFIG = {
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  QUALITY: 0.8,
  FORMAT: 'image/jpeg',
} as const;

export const TIMEOUTS = {
  DEFAULT_REQUEST: 10000, // 10 seconds
  PROFILE_FETCH: 25000, // 25 seconds
  IMAGE_UPLOAD: 30000, // 30 seconds
  SLUG_CHECK_DEBOUNCE: 800, // 0.8 seconds
  TOAST_DURATION: 5000, // 5 seconds
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  GREEN: {
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  RED: {
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  ORANGE: {
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
  },
} as const;