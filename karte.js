    // Bildgröße in Pixeln
    	const imageWidth = 1366; 
		const imageHeight = 768; 

    // Initialisierung Leaflet-Karte 
    	const map = L.map('map', {
        	crs: L.CRS.Simple,  // Welches Koordinatensystem wird verwendet
        	minZoom: -2,        // Herauszoomen (Begrenzung)
        	maxZoom: 5,         // Maximale Zoom-Stufe
        	zoomSnap: 0.5       // Smoother Zoom
    	});

    // Text in rechter Ecke
    	map.attributionControl.setPrefix('IT2:)');
    
    // Zoom-Button + und - entfernen
    	map.zoomControl.remove();

    // Bildgrenzen
    	const southWest = map.unproject([0, imageHeight], map.getMaxZoom());
    	const northEast = map.unproject([imageWidth, 0], map.getMaxZoom());
    	const bounds = new L.LatLngBounds(southWest, northEast);

    // Bild als Overlay
    	L.imageOverlay('JadeHS_VonOben.svg', bounds).addTo(map);
    
    // Karte auf Bildgrenzen
    	map.fitBounds(bounds);

    // Minimaler Zoom 
    	const minZoom = map.getZoom();
    	map.setMinZoom(minZoom); 
	// Maximaler Zoom
    	map.setMaxZoom(10); 
    
    // Karte kann nicht über Bildgrenzen
    	map.setMaxBounds(bounds);// JavaScript Document