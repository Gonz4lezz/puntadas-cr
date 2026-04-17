// Vue.js App para la página de inicio
const { createApp } = Vue;

createApp({
    data() {
        return {
            isLoading: true,
            currentTestimonial: 0,
            testimonials: [
                {
                    name: "María González",
                    image: "images/cliente1.jpg",
                    text: "Increíble trabajo, mi hija quedó encantada con su muñeco de Elsa. La calidad es excepcional.",
                    audio: "audio/testimonio-maria.mp3",
                    rating: 5
                },
                {
                    name: "Carlos Rodríguez", 
                    image: "images/cliente2.jpg",
                    text: "El ramo de flores tejidas fue el regalo perfecto para mi esposa. Trabajo artesanal de primera.",
                    audio: "audio/testimonio-carlos.mp3",
                    rating: 5
                }
            ]
        }
    },
    mounted() {
        this.initializeAnimations();
        this.setupIntersectionObserver();
        this.preloadImages();
    },
    methods: {
        initializeAnimations() {
            // Animación de entrada para elementos
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, observerOptions);

            // Observar elementos para animación
            document.querySelectorAll('.service-card, .testimonial-card').forEach(el => {
                observer.observe(el);
            });
        },

        setupIntersectionObserver() {
            // Observer para lazy loading y animaciones
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        },

        preloadImages() {
            // Precargar imágenes importantes
            const importantImages = [
                'images/carousel1.jpg',
                'images/carousel2.jpg', 
                'images/carousel3.jpg'
            ];

            importantImages.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        },

        scrollToSection(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        },

        playTestimonialAudio(index) {
            const audioElements = document.querySelectorAll('.testimonial-card audio');
            
            // Pausar todos los audios
            audioElements.forEach(audio => {
                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });

            // Reproducir el audio seleccionado
            if (audioElements[index]) {
                audioElements[index].play().catch(e => {
                    console.log('Error al reproducir audio:', e);
                });
            }
        },

        handleServiceCardClick(serviceType) {
            // Redirigir al catálogo con filtro específico
            window.location.href = `catalog.html?category=${serviceType}`;
        },

        // Método para manejar errores de carga de medios
        handleMediaError(event, type) {
            console.warn(`Error cargando ${type}:`, event.target.src);
            
            if (type === 'video') {
                event.target.style.display = 'none';
                const container = event.target.parentElement;
                container.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Video no disponible en este momento
                    </div>
                `;
            }
        },

        // Método para validar formularios (si se agregan)
        validateForm(formData) {
            const errors = [];
            
            if (!formData.email || !this.isValidEmail(formData.email)) {
                errors.push('Email válido es requerido');
            }
            
            if (!formData.name || formData.name.trim().length < 2) {
                errors.push('Nombre debe tener al menos 2 caracteres');
            }
            
            return errors;
        },

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // Método para tracking de eventos (analytics)
        trackEvent(eventName, eventData = {}) {
            // Aquí se puede integrar Google Analytics o similar
            console.log('Event tracked:', eventName, eventData);
            
            // Ejemplo de integración con Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, eventData);
            }
        }
    }
}).mount('#app');

// Funciones JavaScript vanilla para funcionalidades adicionales
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Lazy loading para imágenes
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Manejo de errores de medios
    document.querySelectorAll('video').forEach(video => {
        video.addEventListener('error', function(e) {
            console.warn('Error cargando video:', e);
            this.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-info';
            errorMsg.innerHTML = '<i class="fas fa-info-circle me-2"></i>Video no disponible';
            this.parentNode.appendChild(errorMsg);
        });
    });

    document.querySelectorAll('audio').forEach(audio => {
        audio.addEventListener('error', function(e) {
            console.warn('Error cargando audio:', e);
            this.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-muted small';
            errorMsg.innerHTML = '<i class="fas fa-volume-mute me-1"></i>Audio no disponible';
            this.parentNode.appendChild(errorMsg);
        });
    });

    // Animaciones al hacer scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .testimonial-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-in');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Ejecutar una vez al cargar

    // Mejorar accesibilidad del carrusel
    const carousel = document.querySelector('#heroCarousel');
    if (carousel) {
        carousel.addEventListener('slide.bs.carousel', function (e) {
            // Pausar videos cuando cambie el slide
            const videos = this.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
            });
        });
    }

    // Precargar imágenes críticas
    const criticalImages = [
        'images/logo.png',
        'images/carousel1.jpg'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });

    // Manejo de clicks en tarjetas de servicios
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.addEventListener('click', function() {
            const services = ['muñecos', 'llaveros', 'bolsos', 'flores'];
            window.location.href = `catalog.html?category=${services[index]}`;
        });
        
        // Mejorar accesibilidad
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

// Función para manejar el resize de ventana
window.addEventListener('resize', function() {
    // Ajustar altura del carrusel en dispositivos móviles
    const carousel = document.querySelector('.carousel-inner');
    if (carousel && window.innerWidth < 768) {
        carousel.style.height = '300px';
    } else if (carousel) {
        carousel.style.height = '500px';
    }
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}