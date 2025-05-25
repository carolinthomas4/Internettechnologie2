// VARIABLEN UND KONSTANTEN

//Punkt-Aussehen:)
const customIcon = L.icon({
	iconUrl: 'RoterPunkt.svg',  
    iconSize: [16, 16],        // Icongröße
	//iconAnchor: [8, 16],      // Wo Blase sitzt
    //popupAnchor: [0, -16]      // Wo Blase erscheint
});
	
let clickCoords; //Speichern Koordinaten Mausklick

let currentSound = null;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let currentOscillator = null;
let loopIntervalId = null;  // Für den Loop-Intervall

//Ton-Bibliothek
const tones = {
  ton11: { freq: 523.25, description: "hell, fröhlich" },
  ton12: { freq: 392.00, description: "ruhig, ausgeglichen" },
  ton13: { freq: 349.23, description: "melancholisch" },
  ton14: { freq: 659.25, description: "wach, lebendig" },
  ton15: { freq: 277.18, description: "nachdenklich, schwer" }
};

//HILFSFUNKTIONEN

function showOverlay() {
  const overlay = document.getElementById('overlayEffect');
  overlay.classList.add('show');
}

function hideOverlay() {
  const overlay = document.getElementById('overlayEffect');
  overlay.classList.remove('show');
}

function closeFormAndOverlay() {
	document.getElementById('popupForm').style.display = 'none';
	document.getElementById('markerTitle').value = '';
	document.getElementById('markerText').value = '';
	hideOverlay();
	stopLoop();
}

function playTone(freq, duration = 300) {
  stopTone();

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  const gainNode = audioCtx.createGain();

const volume = parseFloat(document.getElementById('volume').value);
gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();

  setTimeout(() => {
    osc.stop();
    osc.disconnect();
    gainNode.disconnect();
  }, duration);

  currentOscillator = osc;
}

function startLoop(freq) {
  stopLoop(); // Vorherigen Loop stoppen
	
const intervalSlider = document.getElementById('tempo');
const interval = parseInt(intervalSlider.value); // in ms

  playTone(freq); // Direkt starten

  loopIntervalId = setInterval(() => {
    playTone(freq);
  }, interval);
}

function stopTone() {
  if (currentOscillator) {
    try {
      currentOscillator.stop();
    } catch(e) {
      // falls schon gestoppt
    }
    currentOscillator.disconnect();
    currentOscillator = null;
  }
}

function stopLoop() {
  if (loopIntervalId) {
    clearInterval(loopIntervalId);
    loopIntervalId = null;
  }
  stopTone();
}


//MARKER-FUNKTIONEN
function submitMarker() {
  const title = document.getElementById('markerTitle').value;
  const text = document.getElementById('markerText').value;

  const selectedTone = document.querySelector('input[name="stimmung"]:checked');
  const toneId = selectedTone ? selectedTone.value : null;

  const volume = parseFloat(document.getElementById('volume').value);
  const tempo = parseInt(document.getElementById('tempo').value);

  const marker = L.marker(clickCoords, { icon: customIcon }).addTo(map);

  // Speichere alle Infos im Marker
  marker.data = {
    title,
    text,
    toneId,
    volume,
    tempo
  };

  marker.on('click', function () {
  const modal = document.getElementById('myModal');
  document.getElementById('modalTitle').innerText = marker.data.title;
  document.getElementById('modalText').innerText = marker.data.text;
  modal.style.display = 'block';

  if (marker.data && marker.data.toneId) {
    document.getElementById('volume').value = marker.data.volume;
    document.getElementById('tempo').value = marker.data.tempo;

    showOverlay();
    startLoop(tones[marker.data.toneId].freq);
  }

  // Schließen des Modals beim X oder außerhalb
  const closeBtn = document.getElementById('closeModal');

  closeBtn.onclick = function () {
    modal.style.display = 'none';
    hideOverlay();
    stopLoop();
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      hideOverlay();
      stopLoop();
    }
  };
});

  closeFormAndOverlay(); //wieder schließen
}



//EVENT-LISTENER

map.on('contextmenu', function(e) {
	const form = document.getElementById('popupForm');

    if (form.style.display === 'block') {
		return; //kein neuer P bei geöffnetem formu
    	}
	clickCoords = e.latlng;
	form.style.display = 'block';
});

document.addEventListener('keydown', function(e) {
	const formVisible = document.getElementById('popupForm').style.display === 'block';
	if (formVisible && e.key === 'Enter') {
		e.preventDefault(); // Verhindert, Zeilenumbruch durch Enter-> Brauchen wir??
		submitMarker();
		}
});

document.getElementById('closeFormBtn').addEventListener('click', closeFormAndOverlay);


document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('myModal');
  const closeBtn = document.getElementById('closeModal');
});



// Eventlistener fuer Radiobuttons, Loop starten
document.getElementById('radioTon11').addEventListener('click', () => {
  startLoop(tones.ton11.freq);
});

document.getElementById('radioTon12').addEventListener('click', () => {
  startLoop(tones.ton12.freq);
});

document.getElementById('radioTon13').addEventListener('click', () => {
  startLoop(tones.ton13.freq);
});

document.getElementById('radioTon14').addEventListener('click', () => {
  startLoop(tones.ton14.freq);
});

document.getElementById('radioTon15').addEventListener('click', () => {
  startLoop(tones.ton15.freq);
});

document.getElementById('tempo').addEventListener('input', function() {
  const speedValue = this.value;


  // Wenn gerade Ton, neu starten mit neuem Intervall
  if (currentOscillator) {
    const checkedRadio = document.querySelector('input[name="stimmung"]:checked');
    if (checkedRadio) {
      const tone = tones[checkedRadio.value];
      if (tone) {
        startLoop(tone.freq);
      }
    }
  }
});

