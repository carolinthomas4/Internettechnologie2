    // Bildgröße (px)
		const imageWidth = 1838.93; 
		const imageHeight = 1722.14; 

    // InitialisierungKarte 
    	const map = L.map('map', {
        	crs: L.CRS.Simple,  // Koordinatensystem
        	minZoom: 0,        	// Rauszoomen (Begrenzung)
        	maxZoom: 5,        	// Maximale Zoom-Stufe
        	zoomSnap: 0.5      	// Zoom
    	});

    // Text in rechter Ecke
    	map.attributionControl.setPrefix('IT2:)');
    
    // Zoom-Button entfernen
    	map.zoomControl.remove();

    // Bildgrenzen
    	const southWest = map.unproject([0, imageHeight], map.getMaxZoom());
    	const northEast = map.unproject([imageWidth, 0], map.getMaxZoom());
    	const bounds = new L.LatLngBounds(southWest, northEast);

    // Bild als Overlay
    	L.imageOverlay('JadeHS_VonOben3.0.svg', bounds).addTo(map);
    
    // Karte auf Bildgrenzen
    	map.fitBounds(bounds);

    // Minimaler Zoom 
    	const minZoom = map.getZoom();
    	map.setMinZoom(minZoom); 
	// Maximaler Zoom
    	map.setMaxZoom(10); 
    
    // Karte nicht über Bildgrenzen
    	map.setMaxBounds(bounds);

		map.setView([imageHeight / 2, imageWidth / 2], 15);
		const zoomLevel = map.getBoundsZoom(bounds, true); // true = Bild sichtbar, ohne Rand
		map.setView(bounds.getCenter(), zoomLevel);

