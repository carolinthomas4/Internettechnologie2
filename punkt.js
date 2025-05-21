//Punkt-Aussehen:)
const customIcon = L.icon({
 	iconUrl: 'RoterPunkt.svg',  
    iconSize: [16, 16],        // Icongröße
	//iconAnchor: [8, 16],      // Wo Blase sitzt
    //popupAnchor: [0, -16]      // Wo Blase erscheint
});
	
let clickCoords;
	map.on('contextmenu', function(e) {
    const form = document.getElementById('popupForm');

    if (form.style.display === 'block') {
        return; //kein neuer P bei geöffnetem formu
    }

    clickCoords = e.latlng;
    form.style.display = 'block';
});

function closeFormAndOverlay() {
  document.getElementById('popupForm').style.display = 'none';
  document.getElementById('markerTitle').value = '';
  document.getElementById('markerText').value = '';
  hideOverlay();
}
	
function submitMarker() {
	const title = document.getElementById('markerTitle').value;
	const text = document.getElementById('markerText').value;

	const popupContent = `<strong>${title}</strong><br>${text}`;

const marker = L.marker(clickCoords, { icon: customIcon }).addTo(map);

// Öffne PopUp beim Klick
marker.on('click', function() {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalText').innerText = text;
  document.getElementById('myModal').style.display = 'block';
});

// Form, Sounds,Overlay ausblenden
	closeFormAndOverlay();
	stopAllSounds()
}

document.addEventListener('keydown', function(e) {
	const formVisible = document.getElementById('popupForm').style.display === 'block';
		if (formVisible && e.key === 'Enter') {
			e.preventDefault(); // Verhindert, Zeilenumbruch durch Enter-> Brauchen wir??
			submitMarker();
		}
});

document.addEventListener('DOMContentLoaded', function() {
	const closeBtn = document.getElementById('closeModal');
	const modal = document.getElementById('myModal');

	closeBtn.addEventListener('click', function() {
		modal.style.display = 'none'; // PopUp schließen
	});
	
		window.addEventListener('click', function(event) {
		if (event.target === modal) {
			modal.style.display = 'none';
		}
	});
});


const slider1 = document.getElementById('slider1');
const slider1Value = document.getElementById('slider1Value');
slider1Value.textContent = slider1.value;

const slider2 = document.getElementById('slider2');
const slider2Value = document.getElementById('slider2Value');
//slider2Value.textContent = slider2.value;

//const sliderValue = document.getElementById('slider1').value;

const soundPositiv = new Audio('positiv.mp3');
const soundNeutral = new Audio('neutral.mp3');
const soundNegativ = new Audio('traurig.mp3');

let currentSound = null;

function stopAllSounds() {
  [soundPositiv, soundNeutral, soundNegativ].forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
}


function showOverlay() {
  const overlay = document.getElementById('overlayEffect');
  overlay.classList.add('show');
}

function hideOverlay() {
  const overlay = document.getElementById('overlayEffect');
  overlay.classList.remove('show');
}

slider1.addEventListener('input', function () {
  slider1Value.textContent = slider1.value;
  if (currentSound) {
    currentSound.volume = slider1.value / 100;
  }
});

slider2.addEventListener('input', function () {
  //slider2Value.textContent = slider2.value;
  if (currentSound) {
    currentSound.playbackRate = slider2.value / 50; // 50 = norm. Geschw. (1.0)
  }
});


// Funktion: Skal. von 0–100 auf 0.25x – 2.0x
function mapSliderToPlaybackRate(value) {
 const minRate = 0.25;  // min Ges
  const maxRate = 2.0;   // max Ges
	const numericValue = parseFloat(value);
  return minRate + (numericValue / 100) * (maxRate - minRate);
}

slider2.value = 43; // entspr etwa startwert von 1.0x
const initialRate = mapSliderToPlaybackRate(slider2.value);
slider2Value.textContent = initialRate.toFixed(2) + 'x';

slider2.addEventListener('input', function () {
  const rate = mapSliderToPlaybackRate(slider2.value);
  slider2Value.textContent = rate.toFixed(2) + 'x';

  if (currentSound) {
    currentSound.playbackRate = rate;
  }
});


document.getElementById('radioPositiv').addEventListener('click', () => {
  stopAllSounds();
  currentSound = soundPositiv;
	showOverlay();
  currentSound.playbackRate = mapSliderToPlaybackRate(slider2.value);
  currentSound.volume = slider1.value / 100;
  currentSound.play();
});

document.getElementById('radioNeutral').addEventListener('click', () => {
  stopAllSounds();
  currentSound = soundNeutral;
	showOverlay();
  currentSound.playbackRate = mapSliderToPlaybackRate(slider2.value);
  currentSound.volume = slider1.value / 100;
  currentSound.play();
});

document.getElementById('radioNegativ').addEventListener('click', () => {
  stopAllSounds();
  currentSound = soundNegativ;
	showOverlay();
  currentSound.playbackRate = mapSliderToPlaybackRate(slider2.value);
  currentSound.volume = slider1.value / 100;
  currentSound.play();
});

//closeBtn.addEventListener('click', function() {
  //modal.style.display = 'none';
  //hideOverlay();
//});
