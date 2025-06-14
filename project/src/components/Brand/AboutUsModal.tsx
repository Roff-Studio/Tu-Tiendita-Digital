import React, { useState, useEffect } from 'react';
import { X, Heart, Users, Globe, Zap, Target, Award, Share2, ArrowRight, CheckCircle } from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister?: () => void;
}

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose, onRegister }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Auto-advance slides
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000); // 5-second interval

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tu Tiendita Digital - Catálogos gratuitos para emprendedores',
          text: 'Descubre la plataforma creada por emprendedores, para emprendedores.',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      // You could show a toast here to confirm copy
    }
  };

  const nextSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
      setIsAnimating(false);
    }, 150);
  };

  const prevSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + 3) % 3);
      setIsAnimating(false);
    }, 150);
  };

  if (!isOpen) return null;

  const slides = [
    {
      title: "Nuestra Historia: De Emprendedor a Emprendedor",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Empezamos como tú: solos, luchando contra las dificultades del día a día. Visitando ferias, montando puestos en centros comerciales, invirtiendo sudor y sueños en cada producto.
          </p>
          <p className="text-gray-700 leading-relaxed">
            En ese camino, nos dimos cuenta de una verdad dolorosa: las herramientas que debían ayudarnos, en realidad nos condenaban. El ciclo de <strong>armar, mostrar, desmontar y repetir</strong> nos dejaba sin energía. Cuando teníamos ganas, no había tiempo. Y cuando había tiempo, la mente estaba en otra parte.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Así nació <strong>Tu Tiendita Digital</strong>. No como un negocio, sino como una solución a nuestra propia frustración. Una forma de decir "basta" a los dolores de cabeza que nos robaban la vida.
          </p>
        </div>
      )
    },
    {
      title: "Nuestra Misión: DevolverTE el Control",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Liberar tu tiempo para que puedas crear
            </h3>
            <p className="text-blue-800">
              Creemos que tu talento debe estar en tu producto, no en hojas de cálculo. Nuestra misión es automatizar el caos para que puedas enfocarte en lo que amas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">¿No sabes cuánto vendiste?</h4>
              <p className="text-red-800 text-sm">
                Unifica tus ventas de WhatsApp, ferias y redes en un solo lugar. Conoce tu ganancia real, no solo tus ingresos.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">¿Hacer inventario te agota?</h4>
              <p className="text-green-800 text-sm">
                Controla tu stock de forma fácil, rápida y visual. Dedica ese tiempo a tu familia, a descansar, a vivir.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Más que una Herramienta, un Aliado",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Miles</div>
              <div className="text-sm text-gray-600">De Horas Ahorradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Cientos</div>
              <div className="text-sm text-gray-600">De Inventarios Simplificados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Todo</div>
              <div className="text-sm text-gray-600">Tu Negocio en un Lugar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-gray-600">Hecho por Emprendedores</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              ¿Por qué es nuestra obsesión?
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Porque conocemos el sacrificio. Sabemos lo que es terminar el día sin saber si ganaste o perdiste. Tu Tiendita no es solo para vender más, <strong>es para que ordenes tu vida</strong>. Es nuestra forma de asegurarnos que otros emprendedores no solo sobrevivan, sino que recuperen la pasión y disfruten del viaje.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 ease-out"
        style={{
          animation: isOpen ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-in'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Sobre Nosotros</h2>
              <p className="text-blue-100">La historia detrás de Tu Tiendita Digital</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Slide Navigation */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Content */}
          <div className="relative min-h-[400px]">
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
              }`}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {slides[currentSlide].title}
              </h3>
              {slides[currentSlide].content}
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={prevSlide}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Slide anterior"
            >
              <ArrowRight className="h-5 w-5 transform rotate-180" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Siguiente slide"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Compartir</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Heart className="h-4 w-4" />
                <span>Hecho para emprendedores</span>
              </div>
            </div>

            {onRegister && (
              <button
                onClick={() => {
                  onRegister();
                  onClose();
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Únete y recupera tu tiempo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUsModal;