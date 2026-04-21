DOCUMENTACIÓN DE CUMPLIMIENTO DE REQUISITOS - PROYECTO PUNTADAS


1. CONSUMO DE API REST EXTERNO
Ubicación: Página de Catálogo (catalog.html)
Implementación:
API Externa Consumida: API de Hacienda de Costa Rica para tipo de cambio
URL: https://api.hacienda.go.cr/indicadores/tc/dolar
Funcionalidad: Conversión automática de precios de colones a dólares
Código específico:
JAVASCRIPT
async loadExchangeRate() {
    const response = await fetch(this.apiUrls.exchange);
    const data = await response.json();
    this.exchangeRate = parseFloat(data.venta?.valor) || 500;
}



2. CONSUMO DE API REST INTERNO (JSON)
Ubicación: Página de Catálogo (catalog.html)
Implementación:
Archivo JSON: ../data/products.json
Funcionalidad: Carga dinámica de todos los productos del catálogo
Código específico:
JAVASCRIPT
async loadProducts() {
    const response = await fetch(this.apiUrls.products);
    const data = await response.json();
    this.products = data.products || [];
}
Contenido dinámico:
Productos con imágenes, precios, descripciones y categorías
Sistema de filtrado por categoría
Búsqueda en tiempo real
Ordenamiento por nombre, precio y categoría
Estructura del JSON:
JSON
{
  "products": [
    {
      "id": 1,
      "name": "Muñeco de Messi",
      "description": "Muñeco tejido del famoso futbolista",
      "price": 15000,
      "category": "muñecos",
      "image": "images/productos/messi.jpg"
    }
  ]
}


3. BIBLIOTECA DE JAVASCRIPT (VUE.JS)
Páginas implementadas:
A) Página de Catálogo (catalog.html)
Biblioteca: Vue.js 3
Funcionalidades implementadas:
Reactividad de datos: Filtrado y búsqueda en tiempo real
Computed properties: Procesamiento automático de productos filtrados
Watchers: Actualización automática cuando cambian los filtros
Métodos: Gestión de estado, validaciones y eventos
Lifecycle hooks: Inicialización de datos al montar el componente