const { createApp } = Vue;

createApp({
    data() {
        return {
            map: null,
            directionsService: null,
            directionsRenderer: null,

            geolocationSupported: false,
            gettingLocation: false,
            userLocation: null,
            locationError: null,
            distance: null,
            travelTime: null,
            mapLoading: true,

            businessLocation: {
                lat: 10.02001235536649,
                lng: -84.30334335267878
            }
        };
    },

    mounted() {
        this.geolocationSupported = "geolocation" in navigator;
        window.initMap = this.initMap;
    },

    methods: {
        initMap() {
            this.map = new google.maps.Map(document.getElementById("map"), {
                center: this.businessLocation,
                zoom: 14
            });

            new google.maps.Marker({
                position: this.businessLocation,
                map: this.map
            });

            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer();
            this.directionsRenderer.setMap(this.map);

            this.mapLoading = false;
        },

        getCurrentLocation() {
            if (!this.geolocationSupported) {
                this.locationError = "Geolocalización no soportada";
                return;
            }

            this.gettingLocation = true;
            this.locationError = null;

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.userLocation = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };

                    new google.maps.Marker({
                        position: this.userLocation,
                        map: this.map
                    });

                    this.map.setCenter(this.userLocation);

                    this.calculateRouteData();

                    this.gettingLocation = false;
                },
                () => {
                    this.locationError = "No se pudo obtener la ubicación";
                    this.gettingLocation = false;
                }
            );
        },

        calculateRouteData() {
            const request = {
                origin: this.userLocation,
                destination: this.businessLocation,
                travelMode: google.maps.TravelMode.DRIVING
            };

            this.directionsService.route(request, (result, status) => {
                if (status === "OK") {
                    const leg = result.routes[0].legs[0];

                    this.distance = leg.distance.text;
                    this.travelTime = leg.duration.text;
                }
            });
        },

        showRoute() {
            if (!this.userLocation) {
                alert("Primero obtén tu ubicación");
                return;
            }

            const request = {
                origin: this.userLocation,
                destination: this.businessLocation,
                travelMode: google.maps.TravelMode.DRIVING
            };

            this.directionsService.route(request, (result, status) => {
                console.log("STATUS:", status);

                if (status === "OK") {
                    this.directionsRenderer.setDirections(result);
                } else {
                    alert("Error trazando ruta: " + status);
                }
            });
        },

        getDirections() {
            if (!this.userLocation) {
                this.getCurrentLocation();

                setTimeout(() => {
                    this.showRoute();
                }, 1500);

            } else {
                this.showRoute();
            }
        },

        centerMap() {
            this.map.setCenter(this.businessLocation);
        }
    }
}).mount("#locationApp");