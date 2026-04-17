// Vue.js App para el formulario de contacto
const { createApp } = Vue;

createApp({
    data() {
        return {
            // Datos del formulario
            formData: {
                fullName: '',
                email: '',
                birthDate: '',
                incomeRange: '',
                gender: '',
                education: [],
                message: '',
                acceptTerms: false,
                age: null // Campo oculto calculado
            },
            
            // Producto seleccionado (si viene del catálogo)
            selectedProduct: null,
            
            // Estados del formulario
            errors: {},
            isSubmitting: false,
            
            // Configuración
            maxDate: new Date().toISOString().split('T')[0], // Fecha máxima (hoy)
            maxMessageLength: 500
        }
    },
    
    computed: {
        // Calcular edad automáticamente
        calculatedAge() {
            if (!this.formData.birthDate) return null;
            
            const today = new Date();
            const birthDate = new Date(this.formData.birthDate);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // Actualizar el campo oculto
            this.formData.age = age;
            
            return age;
        },
        
        // Contador de caracteres del mensaje
        messageLength() {
            return this.formData.message.length;
        },
        
        // Verificar si el formulario es válido
        isFormValid() {
            return Object.keys(this.errors).length === 0 && 
                   this.formData.fullName && 
                   this.formData.email && 
                   this.formData.birthDate && 
                   this.formData.incomeRange && 
                   this.formData.gender && 
                   this.formData.education.length > 0 && 
                   this.formData.message && 
                   this.formData.acceptTerms;
        }
    },
    
    watch: {
        // Validar campos en tiempo real
        'formData.fullName'() {
            this.validateField('fullName');
        },
        'formData.email'() {
            this.validateField('email');
        },
        'formData.birthDate'() {
            this.validateField('birthDate');
        },
        'formData.incomeRange'() {
            this.validateField('incomeRange');
        },
        'formData.gender'() {
            this.validateField('gender');
        },
        'formData.education'() {
            this.validateField('education');
        },
        'formData.message'() {
            this.validateField('message');
        },
        'formData.acceptTerms'() {
            this.validateField('acceptTerms');
        }
    },
    
    mounted() {
        this.checkUrlParams();
        this.setupFormValidation();
    },
    
    methods: {
        // Verificar parámetros de URL (producto del catálogo)
        checkUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            
            if (urlParams.has('product_id')) {
                this.selectedProduct = {
                    id: urlParams.get('product_id'),
                    name: urlParams.get('product_name') || 'Producto',
                    price: urlParams.get('product_price') || '',
                    category: urlParams.get('product_category') || '',
                    image: `images/productos/${urlParams.get('product_name')?.toLowerCase().replace(/\s+/g, '-')}.jpg` || 'images/placeholder-product.jpg'
                };
                
                // Prellenar el mensaje con información del producto
                this.formData.message = `Hola, estoy interesado/a en el producto "${this.selectedProduct.name}" (${this.selectedProduct.price}). Me gustaría obtener más información sobre:\n\n- Disponibilidad\n- Tiempo de entrega\n- Opciones de personalización\n- Métodos de pago\n\nGracias.`;
            }
        },
        
        // Remover producto seleccionado
        removeProduct() {
            this.selectedProduct = null;
            this.formData.message = '';
            
            // Limpiar URL
            const url = new URL(window.location);
            url.search = '';
            window.history.replaceState({}, '', url);
        },
        
        // Validar campo individual
        validateField(fieldName) {
            const value = this.formData[fieldName];
            
            // Limpiar error previo
            delete this.errors[fieldName];
            
            switch (fieldName) {
                case 'fullName':
                    if (!value || value.trim().length < 2) {
                        this.errors.fullName = 'El nombre debe tener al menos 2 caracteres';
                    } else if (value.trim().length > 100) {
                        this.errors.fullName = 'El nombre no puede exceder 100 caracteres';
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
                        this.errors.fullName = 'El nombre solo puede contener letras y espacios';
                    }
                    break;
                    
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!value) {
                        this.errors.email = 'El email es requerido';
                    } else if (!emailRegex.test(value)) {
                        this.errors.email = 'Ingrese un email válido';
                    }
                    break;
                    
                case 'birthDate':
                    if (!value) {
                        this.errors.birthDate = 'La fecha de nacimiento es requerida';
                    } else {
                        const birthDate = new Date(value);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        
                        if (birthDate > today) {
                            this.errors.birthDate = 'La fecha no puede ser futura';
                        } else if (age < 13) {
                            this.errors.birthDate = 'Debe ser mayor de 13 años';
                        } else if (age > 120) {
                            this.errors.birthDate = 'Ingrese una fecha válida';
                        }
                    }
                    break;
                    
                case 'incomeRange':
                    if (!value) {
                        this.errors.incomeRange = 'Seleccione un rango de ingresos';
                    }
                    break;
                    
                case 'gender':
                    if (!value) {
                        this.errors.gender = 'Seleccione un género';
                    }
                    break;
                    
                case 'education':
                    if (!value || value.length === 0) {
                        this.errors.education = 'Seleccione al menos un grado académico';
                    }
                    break;
                    
                case 'message':
                    if (!value || value.trim().length < 10) {
                        this.errors.message = 'El mensaje debe tener al menos 10 caracteres';
                    } else if (value.length > this.maxMessageLength) {
                        this.errors.message = `El mensaje no puede exceder ${this.maxMessageLength} caracteres`;
                    }
                    break;
                    
                case 'acceptTerms':
                    if (!value) {
                        this.errors.acceptTerms = 'Debe aceptar los términos y condiciones';
                    }
                    break;
            }
        },
        
        // Validar todo el formulario
        validateForm() {
            this.errors = {};
            
            // Validar todos los campos
            Object.keys(this.formData).forEach(field => {
                if (field !== 'age') { // No validar el campo calculado
                    this.validateField(field);
                }
            });
            
            return Object.keys(this.errors).length === 0;
        },
        
        // Enviar formulario
        async submitForm() {
            if (!this.validateForm()) {
                this.showError('Por favor, corrija los errores en el formulario');
                return;
            }
            
            this.isSubmitting = true;
            
            try {
                // Preparar datos para envío
                const formDataToSend = {
                    ...this.formData,
                    selectedProduct: this.selectedProduct,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                };
                
                // Simular envío de email (aquí integrarías con tu servicio de email)
                await this.sendEmail(formDataToSend);
                
                // Mostrar modal de éxito
                this.showSuccessModal();
                
                // Limpiar formulario después de un delay
                setTimeout(() => {
                    this.resetForm();
                }, 2000);
                
                // Tracking del evento
                this.trackEvent('form_submit', {
                    has_product: !!this.selectedProduct,
                    user_age: this.calculatedAge
                });
                
            } catch (error) {
                console.error('Error enviando formulario:', error);
                this.showError('Hubo un error al enviar el mensaje. Por favor, intente nuevamente.');
            } finally {
                this.isSubmitting = false;
            }
        },
        
        // Simular envío de email
        async sendEmail(formData) {
            // Aquí integrarías con EmailJS, Formspree, o tu backend
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simular éxito/error
                    if (Math.random() > 0.1) { // 90% de éxito
                        resolve();
                    } else {
                        reject(new Error('Error de red'));
                    }
                }, 2000);
            });
        },
        
        // Mostrar modal de éxito
        showSuccessModal() {
            const modal = new bootstrap.Modal(document.getElementById('successModal'));
            modal.show();
        },
        
        // Limpiar formulario
        resetForm() {
            this.formData = {
                fullName: '',
                email: '',
                birthDate: '',
                incomeRange: '',
                gender: '',
                education: [],
                message: '',
                acceptTerms: false,
                age: null
            };
            
            this.errors = {};
            
            // Mantener producto seleccionado si existe
            if (this.selectedProduct) {
                this.formData.message = `Hola, estoy interesado/a en el producto "${this.selectedProduct.name}" (${this.selectedProduct.price}). Me gustaría obtener más información.`;
            }
        },
        
        // Mostrar términos y condiciones
        showTerms() {
            alert('Términos y Condiciones:\n\n1. Los datos proporcionados serán utilizados únicamente para contacto comercial.\n2. No compartimos información personal con terceros.\n3. Puede solicitar la eliminación de sus datos en cualquier momento.\n4. Al enviar este formulario acepta recibir comunicaciones de Puntadas.');
        },
        
        // Configurar validación del formulario
        setupFormValidation() {
            // Prevenir envío con Enter en campos de texto
            document.querySelectorAll('input[type="text"], input[type="email"]').forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                    }
                });
            });
            
            // Limitar caracteres en el mensaje
            const messageTextarea = document.getElementById('message');
            if (messageTextarea) {
                messageTextarea.addEventListener('input', (e) => {
                    if (e.target.value.length > this.maxMessageLength) {
                        e.target.value = e.target.value.substring(0, this.maxMessageLength);
                        this.formData.message = e.target.value;
                    }
                });
            }
        },
        
        // Mostrar error
        showError(message) {
            // Crear toast de error
            const toastHtml = `
                <div class="toast align-items-center text-white bg-danger border-0" role="alert">
                    <div class="d-flex">
                        <div class="toast-body">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            `;
            
            // Agregar al DOM
            let toastContainer = document.querySelector('.toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
                document.body.appendChild(toastContainer);
            }
            
            toastContainer.insertAdjacentHTML('beforeend', toastHtml);
            
            // Mostrar toast
            const toastElement = toastContainer.lastElementChild;
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            
            // Remover del DOM después de ocultarse
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        },
        
        // Tracking de eventos
        trackEvent(eventName, eventData = {}) {
            console.log('Event tracked:', eventName, eventData);
            
            // Integración con Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    event_category: 'contact_form',
                    ...eventData
                });
            }
        }
    }
}).mount('#contactApp');

// Funciones JavaScript vanilla adicionales
document.addEventListener('DOMContentLoaded', function() {
    
    // Mejorar UX del formulario
    setupFormEnhancements();
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
    
    // Auto-guardar borrador (opcional)
    setupAutoSave();
});

function setupFormEnhancements() {
    // Animaciones de focus en los campos
    document.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.addEventListener('focus', function() {
            this.parentElement.classList.add('field-focused');
        });
        
        field.addEventListener('blur', function() {
            this.parentElement.classList.remove('field-focused');
        });
    });
    
    // Mejorar selección múltiple
    const educationSelect = document.getElementById('education');
    if (educationSelect) {
        educationSelect.addEventListener('change', function() {
            const selectedCount = this.selectedOptions.length;
            const label = document.querySelector('label[for="education"]');
            if (selectedCount > 0) {
                label.innerHTML = `Grado Académico <span class="badge bg-primary">${selectedCount}</span> <span class="required">*</span>`;
            } else {
                label.innerHTML = 'Grado Académico <span class="required">*</span>';
            }
        });
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para enviar formulario
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
        
        // Escape para limpiar formulario
        if (e.key === 'Escape') {
            const app = document.getElementById('contactApp').__vueParentComponent;
            if (app && confirm('¿Desea limpiar el formulario?')) {
                app.ctx.resetForm();
            }
        }
    });
}

function setupAutoSave() {
    // Guardar borrador cada 30 segundos
    setInterval(() => {
        const app = document.getElementById('contactApp').__vueParentComponent;
        if (app && app.ctx.formData.fullName) {
            localStorage.setItem('contactFormDraft', JSON.stringify(app.ctx.formData));
        }
    }, 30000);
    
    // Cargar borrador al iniciar
    const draft = localStorage.getItem('contactFormDraft');
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            const app = document.getElementById('contactApp').__vueParentComponent;
            if (app && confirm('Se encontró un borrador guardado. ¿Desea cargarlo?')) {
                Object.assign(app.ctx.formData, draftData);
            }
        } catch (e) {
            console.warn('Error cargando borrador:', e);
        }
    }
}

// Limpiar borrador al enviar exitosamente
window.addEventListener('beforeunload', function() {
    localStorage.removeItem('contactFormDraft');
});