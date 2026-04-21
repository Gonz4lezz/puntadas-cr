const { createApp } = Vue;

createApp({
    data() {
        return {
            formData: {
                fullName: '',
                email: '',
                birthDate: '',
                incomeRange: '',
                gender: '',
                education: [],
                message: '',
                age: null
            },
            selectedProduct: null,
            errors: {},
            isSubmitting: false,
            maxDate: new Date().toISOString().split('T')[0],
            maxMessageLength: 500
        }
    },

    computed: {
        calculatedAge() {
            if (!this.formData.birthDate) return null;

            const today = new Date();
            const birthDate = new Date(this.formData.birthDate);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            this.formData.age = age;
            return age;
        },

        messageLength() {
            return this.formData.message.length;
        }
    },

    mounted() {
        this.checkUrlParams();
    },

    methods: {
        checkUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);

            if (urlParams.has('product_id')) {
                this.selectedProduct = {
                    id: urlParams.get('product_id'),
                    name: urlParams.get('product_name') || 'Producto',
                    price: urlParams.get('product_price') || '',
                    category: urlParams.get('product_category') || '',
                    image: urlParams.get('product_image') || ''
                };

                this.formData.message = `Hola, estoy interesado/a en el producto "${this.selectedProduct.name}" (${this.selectedProduct.price}). Me gustaría obtener más información.`;
            }
        },

        removeProduct() {
            this.selectedProduct = null;
            this.formData.message = '';
            const url = new URL(window.location);
            url.search = '';
            window.history.replaceState({}, '', url);
        },

        validateField(fieldName) {
            const value = this.formData[fieldName];
            delete this.errors[fieldName];

            const validations = {
                fullName: () => {
                    if (!value || value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
                    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) return 'Solo letras y espacios';
                },
                email: () => {
                    if (!value) return 'El email es requerido';
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
                },
                birthDate: () => {
                    if (!value) return 'Fecha requerida';
                    const birthDate = new Date(value);
                    if (birthDate > new Date()) return 'Fecha no puede ser futura';
                },
                incomeRange: () => !value ? 'Seleccione un rango' : null,
                gender: () => !value ? 'Seleccione un género' : null,
                education: () => (!value || value.length === 0) ? 'Seleccione al menos uno' : null,
                message: () => {
                    if (!value || value.trim().length < 10) return 'Mínimo 10 caracteres';
                    if (value.length > this.maxMessageLength) return `Máximo ${this.maxMessageLength} caracteres`;
                },
            };

            const error = validations[fieldName] && validations[fieldName]();
            if (error) this.errors[fieldName] = error;
        },

        validateForm() {
            this.errors = {};
            Object.keys(this.formData).forEach(field => {
                if (field !== 'age') this.validateField(field);
            });
            return Object.keys(this.errors).length === 0;
        },

        async submitForm() {
            if (!this.validateForm()) {
                this.showError('Corrija los errores del formulario');
                return;
            }

            this.isSubmitting = true;

            try {
                await this.sendEmailJS();
                this.showSuccessModal();
                setTimeout(() => this.resetForm(), 2000);
            } catch (error) {
                console.error('Error:', error);
                this.showError('Error al enviar. Intente nuevamente.');
                // Fallback a mailto
                this.openMailto();
            } finally {
                this.isSubmitting = false;
            }
        },

        async sendEmailJS() {
            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS no disponible');
            }

            const labels = {
                income: {
                    'menos-500': 'Menos de $500',
                    '500-1000': '$500 - $1,000',
                    '1000-2000': '$1,000 - $2,000',
                    '2000-3000': '$2,000 - $3,000',
                    'mas-3000': 'Más de $3,000'
                },
                gender: {
                    'masculino': 'Masculino',
                    'femenino': 'Femenino',
                    'otro': 'Otro'
                },
                education: {
                    'primaria': 'Primaria',
                    'secundaria': 'Secundaria',
                    'bachillerato': 'Bachillerato',
                    'tecnico': 'Técnico',
                    'universitario': 'Universitario',
                    'licenciatura': 'Licenciatura',
                    'maestria': 'Maestría',
                    'doctorado': 'Doctorado'
                }
            };

            const templateParams = {
                to_email: 'juerguencalvo@gmail.com',
                from_name: this.formData.fullName,
                from_email: this.formData.email,
                subject: `Contacto de ${this.formData.fullName} - Puntadas`,
                full_name: this.formData.fullName,
                email: this.formData.email,
                birth_date: this.formData.birthDate,
                age: this.formData.age,
                gender: labels.gender[this.formData.gender],
                income_range: labels.income[this.formData.incomeRange],
                education: this.formData.education.map(edu => labels.education[edu] || edu).join(', '),
                message: this.formData.message,
                product_info: this.selectedProduct ?
                    `${this.selectedProduct.name} - ${this.selectedProduct.category} - ${this.selectedProduct.price}` :
                    'Sin producto específico',
                timestamp: new Date().toLocaleString('es-CR')
            };

            return await emailjs.send(
                'service_vr989k8',
                'template_zqsyh7s',
                templateParams
            );
        },

        openMailto() {
            const subject = `Contacto de ${this.formData.fullName} - Puntadas`;
            const body = `
Nombre: ${this.formData.fullName}
Email: ${this.formData.email}
Edad: ${this.formData.age} años
Mensaje: ${this.formData.message}
            `;

            const mailtoLink = `mailto:juerguencalvo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoLink, '_blank');
        },

        showSuccessModal() {
            const modal = new bootstrap.Modal(document.getElementById('successModal'));
            modal.show();
        },

        resetForm() {
            this.formData = {
                fullName: '', email: '', birthDate: '', incomeRange: '',
                gender: '', education: [], message: '', age: null
            };
            this.errors = {};

            if (this.selectedProduct) {
                this.formData.message = `Interesado en: ${this.selectedProduct.name}`;
            }
        },

        showError(message) {
            const toast = document.createElement('div');
            toast.className = 'toast align-items-center text-white bg-danger border-0 show';
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            `;

            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container position-fixed top-0 end-0 p-3';
                document.body.appendChild(container);
            }

            container.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        }
    },

    // Validación en tiempo real simplificada
    watch: {
        'formData.fullName'() { if (this.errors.fullName) this.validateField('fullName'); },
        'formData.email'() { if (this.errors.email) this.validateField('email'); },
        'formData.birthDate'() { if (this.errors.birthDate) this.validateField('birthDate'); },
        'formData.message'() { if (this.errors.message) this.validateField('message'); }
    }
}).mount('#contactApp');

// Funciones adicionales mínimas
document.addEventListener('DOMContentLoaded', function () {
    // Contador visual para educación
    const educationSelect = document.getElementById('education');
    if (educationSelect) {
        educationSelect.addEventListener('change', function () {
            const count = this.selectedOptions.length;
            const label = document.querySelector('label[for="education"]');
            label.innerHTML = count > 0 ?
                `Grado Académico <span class="badge bg-primary">${count}</span> <span class="required">*</span>` :
                'Grado Académico <span class="required">*</span>';
        });
    }

    // Envío rápido con Ctrl+Enter
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) submitBtn.click();
        }
    });
});