

function handleServiceCardClick(serviceType) {
    window.location.href = `catalog.html?category=${serviceType}`;
}

function handleMediaError(event, type) {
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
}
// Funciones JavaScript vanilla para funcionalidades adicionales
document.addEventListener('DOMContentLoaded', function () {

    // Manejo de errores de medios
    document.querySelectorAll('video').forEach(video => {
        video.addEventListener('error', function (e) {
            console.warn('Error cargando video:', e);
            this.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-info';
            errorMsg.innerHTML = '<i class="fas fa-info-circle me-2"></i>Video no disponible';
            this.parentNode.appendChild(errorMsg);
        });
    });

    document.querySelectorAll('audio').forEach(audio => {
        audio.addEventListener('error', function (e) {
            console.warn('Error cargando audio:', e);
            this.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-muted small';
            errorMsg.innerHTML = '<i class="fas fa-volume-mute me-1"></i>Audio no disponible';
            this.parentNode.appendChild(errorMsg);
        });
    });

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

});

// Función para manejar el resize de ventana
window.addEventListener('resize', function () {
    // Ajustar altura del carrusel en dispositivos móviles
    const carousel = document.querySelector('.carousel-inner');
    if (carousel && window.innerWidth < 768) {
        carousel.style.height = '300px';
    } else if (carousel) {
        carousel.style.height = '500px';
    }
});