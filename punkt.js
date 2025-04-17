		//Punkt-Aussehen:)
		const customIcon = L.icon({
    		iconUrl: 'RoterPunkt.svg',  
    		iconSize: [16, 16],        // Größe des Icons
			iconAnchor: [8, 16],      // Wo Blase sitzt
    		popupAnchor: [0, -16]      // Wo Popup erscheint
		});
	

		let clickCoords;
		map.on('contextmenu', function(e) {
    		clickCoords = e.latlng;
    		const form = document.getElementById('popupForm');

    		form.style.left = e.originalEvent.pageX + 'px';
    		form.style.top = e.originalEvent.pageY + 'px';
    		form.style.display = 'block';

    		adjustPopupPosition(form);  // Popup positionieren
		});
	
		function submitMarker() {
			const title = document.getElementById('markerTitle').value;
			const text = document.getElementById('markerText').value;

			const popupContent = `<strong>${title}</strong><br>${text}`;

			L.marker(clickCoords, { icon: customIcon }).addTo(map)
				.bindPopup(popupContent)
				.openPopup();
    // Formular wieder ausblenden & resetten
    	document.getElementById('popupForm').style.display = 'none';
    	document.getElementById('markerTitle').value = '';
		}
	// Funktion, um das Formular innerhalb des Bildschirms zu positionieren
		function adjustPopupPosition(form) {
    		const screenWidth = window.innerWidth;
    		const screenHeight = window.innerHeight;

    		let formRect = form.getBoundingClientRect();

    	// Prüft, obs nach rechts hinaus geht
    		if (formRect.right > screenWidth) {
				form.style.left = (screenWidth - formRect.width - 10) + 'px'; // Popup anpassen
    		}
    	// unten
    		if (formRect.bottom > screenHeight) {
        		form.style.top = (screenHeight - formRect.height - 10) + 'px'; // Popup anpassen
    		}
		// links
    		if (formRect.left < 0) {
        		form.style.left = '10px'; // Popup anpassen
    		}
    	// oben
    		if (formRect.top < 0) {
        		form.style.top = '10px'; // Popup anpassen
    		}
		}
		document.addEventListener('keydown', function(e) {
			const formVisible = document.getElementById('popupForm').style.display === 'block';
			if (formVisible && e.key === 'Enter') {
				e.preventDefault(); // Verhindert, Zeilenumbruch durch Enter
				submitMarker();
			}
		});// JavaScript Document