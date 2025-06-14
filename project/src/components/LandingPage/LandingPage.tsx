import React, { useState } from 'react';
import { Store, MessageCircle, Smartphone, Clock, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import AboutUsModal from '../Brand/AboutUsModal';
import AboutUsTrigger from '../Brand/AboutUsTrigger';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onTraditionalLogin?: () => void;
  onTraditionalRegister?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onLogin, 
  onRegister, 
  onTraditionalLogin, 
  onTraditionalRegister 
}) => {
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-8 shadow-lg">
              <Store className="h-10 w-10 text-white" />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Crea tu catálogo digital
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                en minutos
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transforma tu negocio con <span className="font-semibold text-blue-600">Tu Tiendita Digital</span>. 
              Crea un catálogo profesional, conecta con WhatsApp y vende más fácil que nunca.
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={onRegister}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Comenzar Gratis</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Acceder a mi Cuenta
              </button>
            </div>

            {/* Smart Auth Notice */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Acceso inteligente: inicia sesión o regístrate automáticamente</span>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sin límites de productos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Listo en 5 minutos</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para vender online
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas para hacer crecer tu negocio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Conexión Directa con WhatsApp
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tus clientes pueden contactarte directamente desde cada producto. 
                Sin complicaciones, sin intermediarios.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Control de Stock en Tiempo Real
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Marca productos como disponibles o agotados al instante. 
                Tus clientes siempre verán información actualizada.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Diseño Profesional y Móvil
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Catálogos que se ven increíbles en cualquier dispositivo. 
                Optimizado para la experiencia móvil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Así de fácil es empezar
            </h2>
            <p className="text-xl text-gray-600">
              En solo 3 pasos tendrás tu tienda online funcionando
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crea tu cuenta</h3>
              <p className="text-gray-600">Regístrate gratis y configura el nombre de tu tienda</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agrega productos</h3>
              <p className="text-gray-600">Sube fotos, precios y descripciones de tus productos</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparte y vende</h3>
              <p className="text-gray-600">Comparte tu catálogo y recibe pedidos por WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Auth Options (Optional) */}
      {(onTraditionalLogin || onTraditionalRegister) && (
        <section className="py-8 bg-gray-100 border-t">
          <div className="max-w-4xl mx-auto text-center px-4">
            <p className="text-sm text-gray-600 mb-4">
              ¿Prefieres el método tradicional?
            </p>
            <div className="flex justify-center space-x-4">
              {onTraditionalLogin && (
                <button
                  onClick={onTraditionalLogin}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Iniciar Sesión
                </button>
              )}
              {onTraditionalRegister && (
                <button
                  onClick={onTraditionalRegister}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Registrarse
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Listo para hacer crecer tu negocio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de emprendedores que ya están vendiendo con Tu Tiendita Digital
          </p>
          <button
            onClick={onRegister}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Comenzar Ahora - Es Gratis</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Store className="h-6 w-6 text-blue-400" />
                <span className="font-semibold text-lg">Tu Tiendita Digital</span>
              </div>
              <p className="text-gray-400 mb-4">
                Democratizando el comercio digital para emprendedores latinoamericanos.
              </p>
              <AboutUsTrigger 
                onClick={() => setShowAboutModal(true)}
                variant="subtle"
                className="text-blue-400 hover:text-blue-300"
              />
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/privacidad" className="hover:text-white transition-colors">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="/terminos" className="hover:text-white transition-colors">
                    Términos de Servicio
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>contacto@roffstudio.com</li>
                <li>roberto.vt@roffstudio.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Tu Tiendita Digital. Hecho con ❤️ para emprendedores. By{' '}
              <a 
                href="https://www.roffstudio.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ROFF Studio
              </a>.
            </p>
          </div>
        </div>
      </footer>

      {/* About Us Modal */}
      <AboutUsModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        onRegister={onRegister}
      />

      {/* Floating About Us Trigger */}
      <AboutUsTrigger 
        onClick={() => setShowAboutModal(true)}
        variant="floating"
      />
    </div>
  );
};

export default LandingPage;