// Vue.js App para la página del autor
const { createApp } = Vue;

createApp({
    data() {
        return {
            // Información del autor (CAMBIAR CON TUS DATOS REALES)
            authorInfo: {
                name: 'Juan Carlos Pérez Rodríguez',
                title: 'Estudiante de Ingeniería del Software',
                cedula: '1-1234-5678',
                email: 'juan.perez@estudiante.ucr.ac.cr',
                university: 'Universidad de Costa Rica',
                career: 'Ingeniería del Software',
                year: '2024',
                location: 'San José, Costa Rica'
            },
            
            // Habilidades frontend
            frontendSkills: [
                { name: 'HTML5', level: 95 },
                { name: 'CSS3', level: 90 },
                { name: 'JavaScript', level: 85 },
                { name: 'Vue.js', level: 80 },
                { name: 'Bootstrap', level: 88 },
                { name: 'Responsive Design', level: 92 }
            ],
            
            // Habilidades de diseño
            designSkills: [
                { name: 'UI/UX Design', level: 75 },
                { name: 'Mobile First', level: 85 },
                { name: 'Accesibilidad', level: 70 },
                { name: 'Optimización', level: 80 },
                { name: 'Cross-browser', level: 82 },
                { name: 'SEO Básico', level: 65 }
            ],
            
            // Estadísticas del proyecto
            projectStats: {
                linesOfCode: 2847,
                hoursWorked: 45,
                cupsOfCoffee: 23,
                bugsFixed: 17
            },
            
            // Estados de animación
            skillsAnimated: false,
            statsAnimated: false
        }
    },
    
    mounted() {
        this.initializeAnimations();
        this.setupScrollAnimations();
        this.animateSkillBars();
        this.animateStats();
    },
    
    methods: {
        // Inicializar animaciones
        initializeAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        
                        // Activar animaciones específicas
                        if (entry.target.classList.contains('skills-section') && !this.skillsAnimated) {
                            this.animateSkillBars();
                            this.skillsAnimated = true;
                        }
                        
                        if (entry.target.classList.contains('project-stats-section') && !this.statsAnimated) {
                            this.animateStats();
                            this.statsAnimated = true;
                        }
                    }
                });
            }, observerOptions);
            
            // Observar elementos para animación
            document.querySelectorAll('.author-card, .project-card, .tech-stack-card, .skills-section, .info-card, .project-stats-section').forEach(el => {
                observer.observe(el);
            });
        },
        
        // Configurar animaciones de scroll
        setupScrollAnimations() {
            window.addEventListener('scroll', this.handleScroll);
        },
        
        // Manejar scroll para efectos parallax
        handleScroll() {
            const scrolled = window.pageYOffset;
            
            // Efecto parallax sutil en la foto del autor
            const authorPhoto = document.querySelector('.author-photo');
            if (authorPhoto) {
                const rate = scrolled * 0.1;
                authorPhoto.style.transform = `translateY(${rate}px)`;
            }
        },
        
        // Animar barras de habilidades
        animateSkillBars() {
            setTimeout(() => {
                const skillBars = document.querySelectorAll('.skill-progress');
                skillBars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.width = bar.parentElement.parentElement.querySelector('.skill-percentage').textContent;
                        bar.classList.add('animated');
                    }, index * 100);
                });
            }, 500);
        },
        
        // Animar estadísticas
        animateStats() {
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
                    element.textContent = Math.floor(current).toLocaleString();
                }, 16);
            };
            
            // Animar cada estadística
            setTimeout(() => {
                const statNumbers = document.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.dataset.target);
                    if (!isNaN(target)) {
                        animateNumber(stat, target);
                    }
                });
            }, 300);
        },
        
        // Copiar email al portapapeles
        async copyEmail() {
            try {
                await navigator.clipboard.writeText(this.authorInfo.email);
                this.showToast('Email copiado al portapapeles', 'success');
                this.trackEvent('email_copied');
            } catch (err) {
                // Fallback para navegadores que no soportan clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = this.authorInfo.email;
                document.body.appendChild(textArea);
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    this.showToast('Email copiado al portapapeles', 'success');
                    this.trackEvent('email_copied');
                } catch (fallbackErr) {
                    this.showToast('No se pudo copiar el email', 'error');
                }
                
                document.body.removeChild(textArea);
            }
        },
        
        // Mostrar toast
        showToast(message, type = 'info') {
            const toastHtml = `
                <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0" role="alert">
                    <div class="d-flex">
                        <div class="toast-body">
                            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                            ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            `;
            
            const toastContainer = document.querySelector('.toast-container');
            toastContainer.insertAdjacentHTML('beforeend', toastHtml);
            
            const toastElement = toastContainer.lastElementChild;
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            
            // Remover del DOM después de ocultarse
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        },
        
        // Descargar CV (funcionalidad futura)
        downloadCV() {
            this.showToast('Funcionalidad de descarga próximamente', 'info');
            this.trackEvent('cv_download_attempted');
        },
        
        // Tracking de eventos
        trackEvent(eventName, eventData = {}) {
            console.log('Event tracked:', eventName, eventData);
            
            // Integración con Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    event_category: 'author_page',
                    ...eventData
                });
            }
        },
        
        // Obtener información del sistema (para estadísticas adicionales)
        getSystemInfo() {
            return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screenResolution: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                colorDepth: screen.colorDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        },
        
        // Mostrar información técnica del navegador
        showTechnicalInfo() {
            const info = this.getSystemInfo();
            const infoText = Object.entries(info)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            
            alert(`Información Técnica:\n\n${infoText}`);
            this.trackEvent('technical_info_viewed');
        }
    }
}).mount('#authorApp');

// Funciones JavaScript vanilla adicionales
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar efectos hover para tarjetas
    setupHoverEffects();
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
    
    // Configurar easter eggs
    setupEasterEggs();
    
    // Configurar lazy loading
    setupLazyLoading();
});

function setupHoverEffects() {
    // Efectos hover para tarjetas de información
    document.querySelectorAll('.info-card, .stat-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Efecto hover para la foto del autor
    const authorPhoto = document.querySelector('.author-photo');
    if (authorPhoto) {
        authorPhoto.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(2deg)';
        });
        
        authorPhoto.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Efectos hover para elementos de tecnología
    document.querySelectorAll('.tech-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K para mostrar información técnica
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const app = document.getElementById('authorApp').__vueParentComponent?.ctx;
            if (app) {
                app.showTechnicalInfo();
            }
        }
        
        // Ctrl/Cmd + C para copiar email
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            const app = document.getElementById('authorApp').__vueParentComponent?.ctx;
            if (app) {
                app.copyEmail();
            }
        }
    });
}

function setupEasterEggs() {
    // Konami Code easter egg
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateEasterEgg();
            konamiCode = [];
        }
    });
    
    // Click secreto en el logo
    let clickCount = 0;
    const logo = document.querySelector('.logo-img');
    if (logo) {
        logo.addEventListener('click', function() {
            clickCount++;
            if (clickCount === 7) {
                showSecretMessage();
                clickCount = 0;
            }
            
            // Reset counter después de 3 segundos
            setTimeout(() => {
                if (clickCount < 7) clickCount = 0;
            }, 3000);
        });
    }
}

function activateEasterEgg() {
    // Efecto de confetti o animación especial
    document.body.style.animation = 'rainbow 2s infinite';
    
    setTimeout(() => {
        document.body.style.animation = '';
        alert('🎉 ¡Konami Code activado! Eres un verdadero gamer. 🎮');
    }, 2000);
    
    // Agregar CSS para el efecto rainbow
    if (!document.getElementById('easter-egg-styles')) {
        const style = document.createElement('style');
        style.id = 'easter-egg-styles';
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

function showSecretMessage() {
    const messages = [
        "¡Has encontrado el easter egg! 🥚",
        "Desarrollado con mucho ☕ y 💻",
        "¿Sabías que este sitio tiene más de 2800 líneas de código?",
        "Mobile First es el camino 📱",
        "Vue.js hace que todo sea más fácil ⚡"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const app = document.getElementById('authorApp').__vueParentComponent?.ctx;
    if (app) {
        app.showToast(randomMessage, 'success');
        app.trackEvent('easter_egg_found', { message: randomMessage });
    }
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
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
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

// Performance monitoring específico para la página del autor
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log('Author page load time:', loadTime, 'ms');
            
            // Reportar si el tiempo de carga es muy alto
            if (loadTime > 3000) {
                console.warn('Página del autor cargó lentamente:', loadTime, 'ms');
            }
            
            // Tracking de performance
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'author_page_load',
                    value: Math.round(loadTime)
                });
            }
        }, 0);
    });
}

// Cleanup al salir de la página
window.addEventListener('beforeunload', function() {
    // Limpiar event listeners si es necesario
    window.removeEventListener('scroll', function() {});
});

// Manejo de errores específico
window.addEventListener('error', function(event) {
    console.error('Error en author.js:', event.error);
    
    // Reportar errores críticos
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error?.message || 'Unknown error in author page',
            fatal: false
        });
    }
});