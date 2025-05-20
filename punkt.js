//Punkt-Aussehen:)
const customIcon = L.icon({
 	iconUrl: 'RoterPunkt.svg',  
    iconSize: [16, 16],        // Größe des Icons
	iconAnchor: [8, 16],      // Wo Blase sitzt
    popupAnchor: [0, -16]      // Wo Popup erscheint
});
	
let clickCoords;
	map.on('contextmenu', function(e) {
    const form = document.getElementById('popupForm');

    if (form.style.display === 'block') {
        return; //kein neuer Punkt bei geöffnetem Formular
    }

    clickCoords = e.latlng;
    form.style.display = 'block';
});
	
function submitMarker() {
	const title = document.getElementById('markerTitle').value;
	const text = document.getElementById('markerText').value;

	const popupContent = `<strong>${title}</strong><br>${text}`;

const marker = L.marker(clickCoords, { icon: customIcon }).addTo(map);

// Öffne Modal beim Klick auf den Marker
marker.on('click', function() {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalText').innerText = text;
  document.getElementById('myModal').style.display = 'block';
});
			//.openPopup();
// Formular wieder ausblenden & resetten
    document.getElementById('popupForm').style.display = 'none';
    document.getElementById('markerTitle').value = '';
		document.getElementById('markerText').value = '';
}

document.addEventListener('keydown', function(e) {
	const formVisible = document.getElementById('popupForm').style.display === 'block';
		if (formVisible && e.key === 'Enter') {
			e.preventDefault(); // Verhindert, Zeilenumbruch durch Enter
			submitMarker();
		}
});

document.addEventListener('DOMContentLoaded', function() {
	const closeBtn = document.getElementById('closeModal');
	const modal = document.getElementById('myModal');

	closeBtn.addEventListener('click', function() {
		modal.style.display = 'none'; // Modal schließen
	});
	
		window.addEventListener('click', function(event) {
		if (event.target === modal) {
			modal.style.display = 'none';
		}
	});
});