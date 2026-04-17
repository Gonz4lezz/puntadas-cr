// Vue.js App para el catálogo
const { createApp } = Vue;

createApp({
    data() {
        return {
            // Estados principales
            loading: true,
            products: [],
            filteredProducts: [],
            selectedProduct: null,
            
            // Filtros y búsqueda
            selectedCategory: '',
            searchTerm: '',
            sortBy: 'name',
            
            // Moneda
            showInDollars: false,
            exchangeRate: null,
            
            // Categorías
            categories: [
                { id: 'muñecos', name: 'Muñecos', icon: 'fas fa-user-friends' },
                { id: 'llaveros', name: 'Llaveros', icon: 'fas fa-key' },
                { id: 'bolsos', name: 'Bolsos', icon: 'fas fa-shopping-bag' },
                { id: 'flores', name: 'Flores', icon: 'fas fa-seedling' }
            ],
            
            // URLs de APIs
            apiUrls: {
                products: '../data/products.json',
                exchange: 'https://api.hacienda.go.cr/indicadores/tc/dolar'
            }
        }
    },
    
    computed: {
        // Productos filtrados y ordenados
        processedProducts() {
            let result = [...this.products];
            
            // Aplicar filtro de categoría
            if (this.selectedCategory) {
                result = result.filter(product => 
                    product.category === this.selectedCategory
                );
            }
            
            // Aplicar filtro de búsqueda
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                result = result.filter(product =>
                    product.name.toLowerCase().includes(term) ||
                    product.description.toLowerCase().includes(term) ||
                    product.category.toLowerCase().includes(term)
                );
            }
            
            // Aplicar ordenamiento
            result = this.sortProducts(result);
            
            return result;
        }
    },
    
    watch: {
        // Actualizar productos filtrados cuando cambien los filtros
        selectedCategory() {
            this.updateFilteredProducts();
        },
        searchTerm() {
            this.updateFilteredProducts();
        },
        sortBy() {
            this.updateFilteredProducts();
        }
    },
    
    async mounted() {
        await this.initializeApp();
        this.setupEventListeners();
        this.checkUrlParams();
    },
    
    methods: {
        // ===== INICIALIZACIÓN =====
        async initializeApp() {
            try {
                this.loading = true;
                
                // Cargar productos y tipo de cambio en paralelo
                await Promise.all([
                    this.loadProducts(),
                    this.loadExchangeRate()
                ]);
                
                this.updateFilteredProducts();
                
            } catch (error) {
                console.error('Error inicializando la aplicación:', error);
                this.showError('Error cargando los datos');
            } finally {
                this.loading = false;
            }
        },
        
        async loadProducts() {
            try {
                const response = await fetch(this.apiUrls.products);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.products = data.products || [];
                
                console.log(`Cargados ${this.products.length} productos`);
                
            } catch (error) {
                console.error('Error cargando productos:', error);
                // Datos de fallback en caso de error
                this.products = this.getFallbackProducts();
            }
        },
        
        async loadExchangeRate() {
            try {
                const response = await fetch(this.apiUrls.exchange);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.exchangeRate = parseFloat(data.venta?.valor) || 500;
                
                console.log(`Tipo de cambio cargado: ₡${this.exchangeRate}`);
                
            } catch (error) {
                console.error('Error cargando tipo de cambio:', error);
                // Valor por defecto
                this.exchangeRate = 500;
            }
        },
        
        getFallbackProducts() {
            return [
                {
                    id: 1,
                    name: "Muñeco de Messi",
                    description: "Muñeco tejido del famoso futbolista Lionel Messi",
                    price: 15000,
                    category: "muñecos",
                    image: "images/productos/messi.jpg",
                },
                {
                    id: 2,
                    name: "Llavero Abeja",
                    description: "Adorable llavero en forma de abeja",
                    price: 3000,
                    category: "llaveros",
                    image: "images/productos/abeja.jpg",
                }
            ];
        },
        
        // ===== FILTROS Y BÚSQUEDA =====
        updateFilteredProducts() {
            this.filteredProducts = this.processedProducts;
        },
        
        filterProducts() {
            this.updateFilteredProducts();
            this.trackEvent('filter_products', {
                category: this.selectedCategory,
                search_term: this.searchTerm
            });
        },
        
        sortProducts(products = null) {
            const productsToSort = products || [...this.filteredProducts];
            
            switch (this.sortBy) {
                case 'name':
                    return productsToSort.sort((a, b) => 
                        a.name.localeCompare(b.name, 'es')
                    );
                    
                case 'price-low':
                    return productsToSort.sort((a, b) => a.price - b.price);
                    
                case 'price-high':
                    return productsToSort.sort((a, b) => b.price - a.price);
                    
                case 'category':
                    return productsToSort.sort((a, b) => 
                        a.category.localeCompare(b.category, 'es')
                    );
                    
                default:
                    return productsToSort;
            }
        },
        
        clearFilters() {
            this.selectedCategory = '';
            this.searchTerm = '';
            this.sortBy = 'name';
            this.updateFilteredProducts();
            
            // Actualizar URL
            const url = new URL(window.location);
            url.searchParams.delete('category');
            window.history.replaceState({}, '', url);
            
            this.trackEvent('clear_filters');
        },
        
        selectCategory(categoryId) {
            this.selectedCategory = categoryId;
            this.updateFilteredProducts();
            
            // Scroll al grid de productos
            const productsGrid = document.querySelector('.products-grid');
            if (productsGrid) {
                productsGrid.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
            
            this.trackEvent('select_category', { category: categoryId });
        },
        
        // ===== MONEDA =====
        toggleCurrency() {
            this.trackEvent('toggle_currency', { 
                to_dollars: this.showInDollars 
            });
        },
        
        formatPrice(priceInColones) {
            if (this.showInDollars && this.exchangeRate) {
                const priceInDollars = priceInColones / this.exchangeRate;
                return `$${priceInDollars.toFixed(2)}`;
            }
            return `₡${priceInColones.toLocaleString('es-CR')}`;
        },
        
        // ===== PRODUCTOS =====
        viewProductDetails(product) {
            this.selectedProduct = product;
            
            // Mostrar modal usando Bootstrap
            const modal = new bootstrap.Modal(document.getElementById('productModal'));
            modal.show();
            
            this.trackEvent('view_product_details', {
                product_id: product.id,
                product_name: product.name
            });
        },
        
        orderProduct(product) {
            // Crear parámetros para el formulario de contacto
            const params = new URLSearchParams({
                product_id: product.id,
                product_name: product.name,
                product_price: this.formatPrice(product.price),
                product_category: product.category
            });
            
            // Redirigir a la página de contacto con los parámetros
            window.location.href = `contact.html?${params.toString()}`;
            
            this.trackEvent('order_product', {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                currency: this.showInDollars ? 'USD' : 'CRC'
            });
        },
        
        handleImageError(event) {
            // Imagen de fallback cuando no se puede cargar la imagen
            event.target.src = 'images/placeholder-product.jpg';
            event.target.alt = 'Imagen no disponible';
            
            console.warn('Error cargando imagen:', event.target.dataset.originalSrc || event.target.src);
        },
        
        // ===== UTILIDADES =====
        getCategoryName(categoryId) {
            const category = this.categories.find(cat => cat.id === categoryId);
            return category ? category.name : categoryId;
        },
        
        getCategoryCount(categoryId) {
            return this.products.filter(product => 
                product.category === categoryId
            ).length;
        },
        
        checkUrlParams() {
            // Verificar si hay parámetros en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            
            if (category && this.categories.some(cat => cat.id === category)) {
                this.selectedCategory = category;
                this.updateFilteredProducts();
            }
        },
        
        setupEventListeners() {
            // Listener para cambios en el historial del navegador
            window.addEventListener('popstate', () => {
                this.checkUrlParams();
            });
            
            // Listener para teclas de acceso rápido
            document.addEventListener('keydown', (event) => {
                // Ctrl/Cmd + K para enfocar la búsqueda
                if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                    event.preventDefault();
                    const searchInput = document.querySelector('.search-input');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
                
                // Escape para limpiar filtros
                if (event.key === 'Escape') {
                    if (this.selectedCategory || this.searchTerm) {
                        this.clearFilters();
                    }
                }
            });
            
            // Lazy loading para imágenes
            this.setupLazyLoading();
        },
        
        setupLazyLoading() {
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
        },
        
        showError(message) {
            // Mostrar error usando toast o alert
            if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
                // Crear toast de Bootstrap si está disponible
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
                
                // Agregar toast al DOM y mostrarlo
                const toastContainer = document.querySelector('.toast-container') || document.body;
                toastContainer.insertAdjacentHTML('beforeend', toastHtml);
                
                const toastElement = toastContainer.lastElementChild;
                const toast = new bootstrap.Toast(toastElement);
                toast.show();
                
                // Remover del DOM después de que se oculte
                toastElement.addEventListener('hidden.bs.toast', () => {
                    toastElement.remove();
                });
            } else {
                // Fallback a alert nativo
                alert(message);
            }
        },
        
        trackEvent(eventName, eventData = {}) {
            // Tracking de eventos para analytics
            console.log('Event tracked:', eventName, eventData);
            
            // Integración con Google Analytics si está disponible
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    event_category: 'catalog',
                    ...eventData
                });
            }
            
            // Integración con Facebook Pixel si está disponible
            if (typeof fbq !== 'undefined') {
                fbq('track', eventName, eventData);
            }
        }
    }
}).mount('#catalogApp');

// ===== FUNCIONES JAVASCRIPT VANILLA =====
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar tooltips de Bootstrap
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
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
    
    // Configurar animaciones de scroll
    setupScrollAnimations();
    
    // Configurar búsqueda con debounce
    setupSearchDebounce();
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
});

// ===== FUNCIONES DE UTILIDAD =====
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    document.querySelectorAll('.product-card, .category-card, .control-card').forEach(el => {
        observer.observe(el);
    });
}

function setupSearchDebounce() {
    let searchTimeout;
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // El filtrado se maneja en Vue.js
                console.log('Búsqueda:', this.value);
            }, 300);
        });
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Solo procesar si no estamos en un input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(event.key) {
            case '1':
                selectCategoryByIndex(0);
                break;
            case '2':
                selectCategoryByIndex(1);
                break;
            case '3':
                selectCategoryByIndex(2);
                break;
            case '4':
                selectCategoryByIndex(3);
                break;
            case 'c':
                toggleCurrency();
                break;
        }
    });
}

function selectCategoryByIndex(index) {
    const categoryCards = document.querySelectorAll('.category-card');
    if (categoryCards[index]) {
        categoryCards[index].click();
    }
}

function toggleCurrency() {
    const currencyToggle = document.getElementById('currencyToggle');
    if (currencyToggle) {
        currencyToggle.click();
    }
}

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    
    // Reportar error si hay servicio de analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Catalog page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            
            // Reportar métricas de rendimiento
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'catalog_load',
                    value: Math.round(perfData.loadEventEnd - perfData.loadEventStart)
                });
            }
        }, 0);
    });
}

// ===== SERVICE WORKER (OPCIONAL) =====
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

// ===== UTILIDADES EXPORTADAS =====
window.CatalogUtils = {
    formatPrice: function(price, showInDollars = false, exchangeRate = 500) {
        if (showInDollars && exchangeRate) {
            const priceInDollars = price / exchangeRate;
            return `$${priceInDollars.toFixed(2)}`;
        }
        return `₡${price.toLocaleString('es-CR')}`;
    },
    
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};