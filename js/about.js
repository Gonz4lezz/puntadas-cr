// Vue.js App para la página About
const { createApp } = Vue;

createApp({
    data() {
        return {
            // Timeline events
            timelineEvents: [
                {
                    year: '2019',
                    title: 'Los Inicios',
                    description: 'Primeros llaveros y pequeños accesorios como hobby personal. Ana María descubre su pasión por el tejido.',
                    icon: 'fas fa-seedling',
                    stats: [
                        { value: '5', label: 'Productos' },
                        { value: '3', label: 'Clientes' }
                    ]
                },
                {
                    year: '2020',
                    title: 'El Despegue',
                    description: 'Primeros muñecos personalizados y crecimiento durante la pandemia. Conversión del hobby en negocio.',
                    icon: 'fas fa-rocket',
                    stats: [
                        { value: '50', label: 'Productos' },
                        { value: '25', label: 'Clientes' }
                    ]
                },
                {
                    year: '2021',
                    title: 'Expansión',
                    description: 'Incorporación de bolsos y ramos de flores a la línea de productos. Primer taller dedicado.',
                    icon: 'fas fa-expand-arrows-alt',
                    stats: [
                        { value: '150', label: 'Productos' },
                        { value: '75', label: 'Clientes' }
                    ]
                },
                {
                    year: '2022',
                    title: 'Reconocimiento',
                    description: 'Participación en ferias artesanales y reconocimiento local. Crecimiento del equipo.',
                    icon: 'fas fa-award',
                    stats: [
                        { value: '300', label: 'Productos' },
                        { value: '120', label: 'Clientes' }
                    ]
                },
                {
                    year: '2024',
                    title: 'Presente',
                    description: 'Marca establecida con presencia digital y clientes satisfechos en todo el país.',
                    icon: 'fas fa-star',
                    stats: [
                        { value: '500+', label: 'Productos' },
                        { value: '200+', label: 'Clientes' }
                    ]
                }
            ],
            
            // Testimonials
            testimonials: [
                {
                    name: 'María González',
                    role: 'Madre de familia',
                    text: 'Increíble trabajo, mi hija quedó encantada con su muñeco de Elsa. La calidad es excepcional y el detalle impresionante. Definitivamente volveré a comprar.',
                    image: 'images/testimonios/maria.jpg'
                },
                {
                    name: 'Carlos Rodríguez',
                    role: 'Empresario',
                    text: 'El ramo de flores tejidas fue el regalo perfecto para mi esposa en nuestro aniversario. Trabajo artesanal de primera calidad que perdurará para siempre.',
                    image: 'images/testimonios/carlos.jpg'
                },
                {
                    name: 'Laura Jiménez',
                    role: 'Profesora',
                    text: 'Compré varios llaveros para mis estudiantes como premio por su buen rendimiento. Todos quedaron fascinados con los diseños únicos y coloridos.',
                    image: 'images/testimonios/laura.jpg'
                },
                {
                    name: 'Roberto Mora',
                    role: 'Coleccionista',
                    text: 'Como fanático del anime, el muñeco de Luffy que me hicieron es perfecto. Cada detalle está cuidadosamente trabajado. Arte puro en forma de tejido.',
                    image: 'images/testimonios/roberto.jpg'
                }
            ],
            
            // Estados de la aplicación
            activeTimelineItem: 0,
            activeTestimonial: 0,
            testimonialInterval: null,
            isVisible: {
                timeline: false,
                testimonials: false,
                team: false
            }
        }
    },
    
    mounted() {
        this.initializeAnimations();
        this.startTestimonialCarousel();
        this.setupScrollAnimations();
        this.animateCounters();
    },
    
    beforeUnmount() {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
        }
    },
    
    methods: {
        // Timeline methods
        setActiveTimelineItem(index) {
            this.activeTimelineItem = index;
            this.trackEvent('timeline_item_clicked', { item: index });
        },
        
        // Testimonial carousel methods
        setActiveTestimonial(index) {
            this.activeTestimonial = index;
            this.resetTestimonialInterval();
        },
        
        nextTestimonial() {
            this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
            this.resetTestimonialInterval();
        },
        
        prevTestimonial() {
            this.activeTestimonial = this.activeTestimonial === 0 
                ? this.testimonials.length - 1 
                : this.activeTestimonial - 1;
            this.resetTestimonialInterval();
        },
        
        startTestimonialCarousel() {
            this.testimonialInterval = setInterval(() => {
                this.nextTestimonial();
            }, 5000);
        },
        
        resetTestimonialInterval() {
            if (this.testimonialInterval) {
                clearInterval(this.testimonialInterval);
                this.startTestimonialCarousel();
            }
        },
        
        // Animation methods
        initializeAnimations() {
            // Configurar observer para animaciones de entrada
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        
                        // Activar animaciones específicas
                        if (entry.target.classList.contains('timeline-container')) {
                            this.isVisible.timeline = true;
                            this.animateTimelineItems();
                        }
                        
                        if (entry.target.classList.contains('testimonials-carousel')) {
                            this.isVisible.testimonials = true;
                        }
                        
                        if (entry.target.classList.contains('team-section')) {
                            this.isVisible.team = true;
                            this.animateTeamCards();
                        }
                    }
                });
            }, observerOptions);
            
            // Observar elementos para animación
            document.querySelectorAll('.story-content, .philosophy-card, .timeline-container, .testimonials-carousel, .team-section, .process-step').forEach(el => {
                observer.observe(el);
            });
        },
        
        setupScrollAnimations() {
            // Parallax effect para imágenes de historia
            window.addEventListener('scroll', this.handleScroll);
        },
        
        handleScroll() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Parallax para imágenes de historia
            document.querySelectorAll('.story-image').forEach((img, index) => {
                const speed = (index % 2 === 0) ? 0.3 : -0.3;
                img.style.transform = `translateY(${scrolled * speed}px)`;
            });
        },
        
        animateTimelineItems() {
            const items = document.querySelectorAll('.timeline-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate-in');
                }, index * 200);
            });
        },
        
        animateTeamCards() {
            const cards = document.querySelectorAll('.team-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, index * 300);
            });
        },
        
        animateCounters() {
            // Animar números en las estadísticas
            const animateNumber = (element, target, duration = 2000) => {
                const start = 0;
                const increment = target / (duration / 16);
                let current = start;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    // Formatear número
                    let displayValue = Math.floor(current);
                    if (target >= 500) {
                        displayValue = displayValue + '+';
                    }
                    
                    element.textContent = displayValue;
                }, 16);
            };
            
            // Observer para iniciar animación cuando sea visible
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const statNumbers = entry.target.querySelectorAll('.stat-number');
                        
                        statNumbers.forEach(stat => {
                            const target = parseInt(stat.textContent.replace('+', ''));
                            if (!isNaN(target)) {
                                animateNumber(stat, target);
                            }
                        });
                        
                        statsObserver.unobserve(entry.target);
                    }
                });
            });
            
            // Observar secciones con estadísticas
            document.querySelectorAll('.story-stats, .timeline-stats').forEach(section => {
                statsObserver.observe(section);
            });
        },
        
        // Utility methods
        trackEvent(eventName, eventData = {}) {
            console.log('Event tracked:', eventName, eventData);
            
            // Integración con Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    event_category: 'about_page',
                    ...eventData
                });
            }
        },
        
        handleImageError(event) {
            // Imagen de fallback
            event.target.src = 'images/placeholder.jpg';
            console.warn('Error cargando imagen:', event.target.dataset.originalSrc || event.target.src);
        }
    }
}).mount('#aboutApp');

// Funciones JavaScript vanilla adicionales
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar smooth scrolling
    setupSmoothScrolling();
    
    // Configurar lazy loading para imágenes
    setupLazyLoading();
    
    // Configurar efectos hover para tarjetas
    setupHoverEffects();
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
});

function setupSmoothScrolling() {
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
}

function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
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
        
        // Observar imágenes lazy
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

function setupHoverEffects() {
    // Efectos hover para tarjetas de filosofía
    document.querySelectorAll('.philosophy-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Efectos hover para tarjetas de equipo
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.team-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.team-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        const app = document.getElementById('aboutApp').__vueParentComponent?.ctx;
        if (!app) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    app.prevTestimonial();
                }
                break;
                
            case 'ArrowRight':
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    app.nextTestimonial();
                }
                break;
                
            case ' ':
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    app.nextTestimonial();
                }
                break;
        }
    });
}

// Configurar tooltips si están disponibles
if (typeof bootstrap !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    });
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('About page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

// Manejo de errores globales
window.addEventListener('error', function(event) {
    console.error('Error en about.js:', event.error);
});

// Cleanup al salir de la página
window.addEventListener('beforeunload', function() {
    // Limpiar intervalos y observers si es necesario
    const app = document.getElementById('aboutApp').__vueParentComponent?.ctx;
    if (app && app.testimonialInterval) {
        clearInterval(app.testimonialInterval);
    }
});