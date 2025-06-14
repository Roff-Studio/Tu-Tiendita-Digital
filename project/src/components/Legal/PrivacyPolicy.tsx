import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Globe, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver al inicio</span>
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Tu Tiendita Digital</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
            <p className="text-blue-100 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Última actualización: 13 de enero de 2025</span>
            </p>
          </div>

          {/* Navigation */}
          <nav className="bg-gray-50 p-6 border-b border-gray-200" aria-label="Navegación de secciones">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de contenidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { id: 'introduccion', title: '1. Introducción' },
                { id: 'informacion-recopilada', title: '2. Información que recopilamos' },
                { id: 'uso-informacion', title: '3. Cómo usamos tu información' },
                { id: 'compartir-informacion', title: '4. Compartir información' },
                { id: 'seguridad', title: '5. Seguridad de datos' },
                { id: 'derechos', title: '6. Tus derechos' },
                { id: 'cookies', title: '7. Cookies y tecnologías similares' },
                { id: 'contacto', title: '8. Contacto' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="p-8 space-y-12">
            {/* Introducción */}
            <section id="introduccion">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Eye className="h-6 w-6 text-blue-600" />
                <span>1. Introducción</span>
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  En Tu Tiendita Digital, valoramos y respetamos tu privacidad. Esta Política de Privacidad 
                  describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando 
                  utilizas nuestra plataforma de gestión de catálogos.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nos comprometemos a cumplir con las regulaciones de protección de datos aplicables, 
                  incluyendo el Reglamento General de Protección de Datos (GDPR) de la Unión Europea 
                  y la Ley sobre Protección de la Vida Privada #19.628.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">
                    Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política.
                  </p>
                </div>
              </div>
            </section>

            {/* Información que recopilamos */}
            <section id="informacion-recopilada">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que recopilamos</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Información que proporcionas directamente</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Información de cuenta:</strong> Nombre, dirección de correo electrónico, contraseña</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Información de tienda:</strong> Nombre de la tienda, URL personalizada, número de WhatsApp</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Contenido del producto:</strong> Nombres, descripciones, precios, imágenes, categorías</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Comunicaciones:</strong> Mensajes que nos envías a través de formularios de contacto</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Información recopilada automáticamente</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Datos de uso:</strong> Páginas visitadas, tiempo de permanencia, clics, interacciones</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema operativo, dispositivo</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Cookies y tecnologías similares:</strong> Para mejorar la funcionalidad y experiencia</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Uso de información */}
            <section id="uso-informacion">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo usamos tu información</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Servicios principales</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Crear y mantener tu cuenta</li>
                    <li>• Gestionar tu catálogo de productos</li>
                    <li>• Procesar y mostrar tu contenido</li>
                    <li>• Facilitar la comunicación con clientes</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mejoras y soporte</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Proporcionar soporte técnico</li>
                    <li>• Mejorar nuestros servicios</li>
                    <li>• Analizar patrones de uso</li>
                    <li>• Desarrollar nuevas funcionalidades</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Comunicación</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Enviar actualizaciones importantes</li>
                    <li>• Notificar cambios en el servicio</li>
                    <li>• Responder a tus consultas</li>
                    <li>• Compartir consejos y mejores prácticas</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seguridad y legal</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Proteger contra fraude y abuso</li>
                    <li>• Cumplir obligaciones legales</li>
                    <li>• Resolver disputas</li>
                    <li>• Hacer cumplir nuestros términos</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Compartir información */}
            <section id="compartir-informacion">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir información</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">🔒 Compromiso de privacidad</p>
                  <p className="text-green-700">
                    No vendemos, alquilamos ni compartimos tu información personal con terceros 
                    para fines comerciales sin tu consentimiento explícito.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Compartimos información únicamente en estos casos:</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                      <div>
                        <strong>Con tu consentimiento:</strong> Cuando nos das permiso explícito para compartir información específica.
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                      <div>
                        <strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar la plataforma (hosting, análisis, soporte).
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                      <div>
                        <strong>Requerimientos legales:</strong> Cuando la ley nos obliga a divulgar información.
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                      <div>
                        <strong>Protección de derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Seguridad */}
            <section id="seguridad">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Lock className="h-6 w-6 text-blue-600" />
                <span>5. Seguridad de datos</span>
              </h2>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas 
                  para proteger tu información personal contra acceso no autorizado, alteración, 
                  divulgación o destrucción.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Encriptación</h3>
                    <p className="text-sm text-gray-600">Datos encriptados en tránsito y en reposo</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Acceso controlado</h3>
                    <p className="text-sm text-gray-600">Solo personal autorizado accede a los datos</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Monitoreo</h3>
                    <p className="text-sm text-gray-600">Supervisión continua de la seguridad</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Derechos del usuario */}
            <section id="derechos">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Tus derechos</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Tienes varios derechos respecto a tu información personal. Puedes ejercer estos 
                  derechos contactándonos en cualquier momento.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Acceso', desc: 'Solicitar una copia de tu información personal' },
                    { title: 'Rectificación', desc: 'Corregir información inexacta o incompleta' },
                    { title: 'Eliminación', desc: 'Solicitar la eliminación de tu información' },
                    { title: 'Portabilidad', desc: 'Recibir tus datos en formato estructurado' },
                    { title: 'Restricción', desc: 'Limitar el procesamiento de tu información' },
                    { title: 'Oposición', desc: 'Oponerte al procesamiento de tus datos' }
                  ].map((right, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
                      <p className="text-sm text-gray-600">{right.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies y tecnologías similares</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
                  analizar el uso del sitio y personalizar el contenido.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Tipos de cookies que utilizamos:</h3>
                  <ul className="space-y-1 text-yellow-700 text-sm">
                    <li>• <strong>Esenciales:</strong> Necesarias para el funcionamiento básico</li>
                    <li>• <strong>Funcionales:</strong> Mejoran la funcionalidad y personalización</li>
                    <li>• <strong>Analíticas:</strong> Nos ayudan a entender cómo usas el sitio</li>
                    <li>• <strong>Rendimiento:</strong> Optimizan la velocidad y rendimiento</li>
                  </ul>
                </div>
                
                <p className="text-gray-700 text-sm">
                  Puedes controlar las cookies a través de la configuración de tu navegador. 
                  Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section id="contacto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Mail className="h-6 w-6 text-blue-600" />
                <span>8. Contacto</span>
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Si tienes preguntas sobre esta Política de Privacidad o quieres ejercer tus derechos, 
                  puedes contactarnos:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> contacto@roffstudio.com</p>
                  <p><strong>Dirección:</strong> Disponible bajo solicitud</p>
                  <p><strong>Tiempo de respuesta:</strong> Máximo 30 días</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110"
        aria-label="Volver arriba"
      >
        <ArrowLeft className="h-5 w-5 transform rotate-90" />
      </button>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Tu Tiendita Digital</span>
          </div>
          <p className="text-gray-400 text-sm">
            Comprometidos con la protección de tu privacidad y datos personales.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;