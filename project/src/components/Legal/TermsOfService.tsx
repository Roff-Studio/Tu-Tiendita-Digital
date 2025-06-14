import React from 'react';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, Calendar, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
              <Scale className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Tu Tiendita Digital</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Términos de Servicio</h1>
            <p className="text-indigo-100 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Última actualización: 13 de enero de 2025</span>
            </p>
          </div>

          {/* Navigation */}
          <nav className="bg-gray-50 p-6 border-b border-gray-200" aria-label="Navegación de secciones">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de contenidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { id: 'aceptacion', title: '1. Aceptación de términos' },
                { id: 'descripcion-servicio', title: '2. Descripción del servicio' },
                { id: 'registro-cuenta', title: '3. Registro y cuenta' },
                { id: 'uso-aceptable', title: '4. Uso aceptable' },
                { id: 'contenido-usuario', title: '5. Contenido del usuario' },
                { id: 'propiedad-intelectual', title: '6. Propiedad intelectual' },
                { id: 'limitaciones', title: '7. Limitaciones de responsabilidad' },
                { id: 'terminacion', title: '8. Terminación' },
                { id: 'modificaciones', title: '9. Modificaciones' },
                { id: 'ley-aplicable', title: '10. Ley aplicable' }
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
            {/* Aceptación */}
            <section id="aceptacion">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>1. Aceptación de términos</span>
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bienvenido a Tu Tiendita Digital. Estos Términos de Servicio ("Términos") rigen tu 
                  uso de nuestra plataforma de gestión de catálogos en línea y todos los servicios 
                  relacionados proporcionados por Tu Tiendita Digital ("nosotros", "nuestro" o "la Empresa").
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al acceder o utilizar nuestros servicios, aceptas estar legalmente vinculado por 
                  estos Términos. Si no estás de acuerdo con alguna parte de estos términos, 
                  no debes utilizar nuestros servicios.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium">
                    ⚠️ Importante: Estos términos constituyen un acuerdo legal entre tú y Tu Tiendita Digital.
                  </p>
                </div>
              </div>
            </section>

            {/* Descripción del servicio */}
            <section id="descripcion-servicio">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del servicio</h2>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Tu Tiendita Digital es una plataforma gratuita que permite a pequeños empresarios 
                  crear y gestionar catálogos digitales de productos con integración a WhatsApp.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Servicios incluidos</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li>• Creación de catálogos digitales</li>
                      <li>• Gestión de productos e inventario</li>
                      <li>• Integración con WhatsApp</li>
                      <li>• Hosting y almacenamiento</li>
                      <li>• URLs personalizadas</li>
                      <li>• Soporte técnico básico</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Características</h3>
                    <ul className="space-y-2 text-green-800 text-sm">
                      <li>• 100% gratuito</li>
                      <li>• Sin límites de productos</li>
                      <li>• Diseño responsive</li>
                      <li>• Actualizaciones automáticas</li>
                      <li>• Seguridad avanzada</li>
                      <li>• Interfaz en español</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Nota:</strong> Nos reservamos el derecho de modificar, suspender o 
                    discontinuar cualquier aspecto del servicio en cualquier momento, con o sin previo aviso.
                  </p>
                </div>
              </div>
            </section>

            {/* Registro y cuenta */}
            <section id="registro-cuenta">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro y cuenta</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Requisitos de registro</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Debes tener al menos 18 años o la mayoría de edad en tu jurisdicción</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Proporcionar información precisa y completa durante el registro</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Mantener actualizada tu información de contacto</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Ser responsable de mantener la confidencialidad de tu contraseña</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Responsabilidades de la cuenta</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">
                      <strong>Importante:</strong> Eres completamente responsable de todas las 
                      actividades que ocurran bajo tu cuenta. Notifícanos inmediatamente si 
                      sospechas de uso no autorizado.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Uso aceptable */}
            <section id="uso-aceptable">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <span>4. Uso aceptable</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-green-900 mb-3">✅ Usos permitidos</h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <ul className="space-y-2 text-green-800">
                      <li>• Crear catálogos para productos legales</li>
                      <li>• Promocionar tu negocio legítimo</li>
                      <li>• Compartir información precisa de productos</li>
                      <li>• Comunicarte con clientes potenciales</li>
                      <li>• Usar las funcionalidades según su propósito</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-red-900 mb-3">❌ Usos prohibidos</h3>
                  <div className="bg-red-50 rounded-lg p-4">
                    <ul className="space-y-2 text-red-800">
                      <li>• Vender productos ilegales o prohibidos</li>
                      <li>• Publicar contenido ofensivo, difamatorio o discriminatorio</li>
                      <li>• Violar derechos de propiedad intelectual</li>
                      <li>• Realizar actividades fraudulentas o engañosas</li>
                      <li>• Interferir con el funcionamiento del servicio</li>
                      <li>• Usar el servicio para spam o comunicaciones no solicitadas</li>
                      <li>• Intentar acceder a cuentas de otros usuarios</li>
                      <li>• Realizar ingeniería inversa del software</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    <strong>Consecuencias:</strong> El incumplimiento de estas reglas puede resultar 
                    en la suspensión o terminación inmediata de tu cuenta sin previo aviso.
                  </p>
                </div>
              </div>
            </section>

            {/* Contenido del usuario */}
            <section id="contenido-usuario">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contenido del usuario</h2>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Mantienes todos los derechos sobre el contenido que publicas en tu catálogo 
                  (textos, imágenes, descripciones, etc.). Sin embargo, nos otorgas ciertos 
                  derechos para poder proporcionar el servicio.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tus derechos</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Mantienes la propiedad de tu contenido</li>
                      <li>• Puedes modificar o eliminar tu contenido</li>
                      <li>• Controlas la visibilidad de tus productos</li>
                      <li>• Decides cómo presentar tu negocio</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Licencia que nos otorgas</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Mostrar tu contenido en la plataforma</li>
                      <li>• Almacenar y procesar tu información</li>
                      <li>• Optimizar imágenes para mejor rendimiento</li>
                      <li>• Hacer copias de seguridad de tu contenido</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Responsabilidades del contenido</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2 text-blue-800">
                      <li>• Garantizas que tienes derecho a publicar todo tu contenido</li>
                      <li>• Tu contenido no viola derechos de terceros</li>
                      <li>• La información de productos es precisa y actualizada</li>
                      <li>• Las imágenes representan fielmente los productos</li>
                      <li>• Cumples con todas las leyes aplicables</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Propiedad intelectual */}
            <section id="propiedad-intelectual">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad intelectual</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  La plataforma Tu Tiendita Digital, incluyendo su diseño, código, logotipos, 
                  y funcionalidades, está protegida por derechos de propiedad intelectual.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Nuestros derechos</h3>
                    <ul className="space-y-2 text-purple-800 text-sm">
                      <li>• Código fuente de la plataforma</li>
                      <li>• Diseño e interfaz de usuario</li>
                      <li>• Logotipos y marca "Tu Tiendita Digital"</li>
                      <li>• Documentación y materiales de ayuda</li>
                      <li>• Algoritmos y funcionalidades</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Tus derechos</h3>
                    <ul className="space-y-2 text-green-800 text-sm">
                      <li>• Contenido de tus productos</li>
                      <li>• Imágenes que subas</li>
                      <li>• Textos y descripciones</li>
                      <li>• Nombre y branding de tu tienda</li>
                      <li>• Información de contacto</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Respeto mutuo:</strong> Respetamos tus derechos de propiedad intelectual 
                    y esperamos que hagas lo mismo con los nuestros y los de otros usuarios.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitaciones */}
            <section id="limitaciones">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitaciones de responsabilidad</h2>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Exención de garantías</h3>
                  <p className="text-red-800 text-sm leading-relaxed">
                    El servicio se proporciona "tal como está" y "según disponibilidad". 
                    No garantizamos que el servicio sea ininterrumpido, libre de errores, 
                    o que satisfaga tus necesidades específicas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">No somos responsables por:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Pérdida de datos o contenido</li>
                      <li>• Interrupciones del servicio</li>
                      <li>• Errores o inexactitudes</li>
                      <li>• Daños indirectos o consecuenciales</li>
                      <li>• Acciones de terceros</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Limitación de daños:</h4>
                    <p className="text-gray-700 text-sm">
                      En ningún caso nuestra responsabilidad total excederá 
                      el monto que hayas pagado por el servicio en los 
                      últimos 12 meses (que es $0 para servicios gratuitos).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Terminación */}
            <section id="terminacion">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Terminación</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Terminación por tu parte</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Puedes terminar tu cuenta en cualquier momento eliminando tu perfil 
                    desde la configuración de tu cuenta o contactándonos directamente.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      Al terminar tu cuenta, tu catálogo dejará de estar disponible públicamente 
                      y tus datos serán eliminados según nuestra política de privacidad.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Terminación por nuestra parte</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Podemos suspender o terminar tu cuenta si:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Violas estos términos de servicio</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Usas el servicio para actividades ilegales</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Tu cuenta permanece inactiva por más de 2 años</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Es necesario por razones legales o de seguridad</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Modificaciones */}
            <section id="modificaciones">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificaciones</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Las modificaciones entrarán en vigor inmediatamente después de su publicación.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-green-900 font-semibold mb-2">Notificación de cambios</h3>
                  <ul className="space-y-1 text-green-800 text-sm">
                    <li>• Te notificaremos por email sobre cambios importantes</li>
                    <li>• Los cambios se publicarán en esta página</li>
                    <li>• La fecha de "última actualización" se modificará</li>
                    <li>• Tendrás 30 días para objetar cambios significativos</li>
                  </ul>
                </div>
                
                <p className="text-gray-700 text-sm">
                  Tu uso continuado del servicio después de las modificaciones constituye 
                  tu aceptación de los nuevos términos.
                </p>
              </div>
            </section>

            {/* Ley aplicable */}
            <section id="ley-aplicable">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Globe className="h-6 w-6 text-blue-600" />
                <span>10. Ley aplicable y jurisdicción</span>
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Estos términos se rigen por las leyes de Chile y cualquier disputa 
                  será resuelta en los tribunales competentes de Santiago, Chile.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Resolución de disputas</h3>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                      <span><strong>Contacto directo:</strong> Intenta resolver la disputa contactándonos directamente</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                      <span><strong>Mediación:</strong> Si no se resuelve, podemos recurrir a mediación</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                      <span><strong>Arbitraje:</strong> Como último recurso, arbitraje vinculante</span>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Contacto para disputas:</strong> roberto.vt@roffstudio.com
                  </p>
                </div>
              </div>
            </section>

            {/* Información de contacto */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p><strong>Email general:</strong> contacto@roffstudio.com</p>
                  <p><strong>Soporte técnico:</strong> contacto@roffstudio.com</p>
                  <p><strong>Asuntos legales:</strong> roberto.vt@roffstudio.com</p>
                </div>
                <div>
                  <p><strong>Empresa:</strong> ROFF STUDIO SpA</p>
                  <p><strong>País:</strong> Chile</p>
                  <p><strong>Tiempo de respuesta:</strong> 12-48 horas</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110"
        aria-label="Volver arriba"
      >
        <ArrowLeft className="h-5 w-5 transform rotate-90" />
      </button>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scale className="h-5 w-5" />
            <span className="font-semibold">Tu Tiendita Digital</span>
          </div>
          <p className="text-gray-400 text-sm">
            Términos justos y transparentes para empoderar tu negocio digital.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;