// VARIABLEN UND KONSTANTEN


//Punkt-Aussehen:)
const customIcon = L.icon({
	iconUrl: 'RoterPunkt.svg',  
    iconSize: [16, 16],        // Icongröße
	//iconAnchor: [8, 16],      // Wo Blase sitzt
    //popupAnchor: [0, -16]      // Wo Blase erscheint
});
	
let clickCoords; // Speichert Klickkoordinaten
let currentOscillator = null;
let loopIntervalId = null;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const tones = {
  ton11: { freq: 523.25 },
  ton12: { freq: 392.00 },
  ton13: { freq: 349.23 },
  ton14: { freq: 659.25 },
  ton15: { freq: 277.18 }
};

//const extraTones = [
	//{ freqs: [523.25, 587.33, 659.25, 698.46, 783.99], type: 'sine' },
	//{ freqs: [261.63, 293.66, 329.63, 349.23, 392.00], type: 'square' },
	//{ freqs: [196.00, 220.00, 246.94, 261.63, 293.66], type: 'triangle' },
	//{ freqs: [523.25, 587.33, 659.25, 698.46, 783.99], type: 'sawtooth' },
//];

//HILFSFUNKTIONEN
function playTone(freq, duration = 300) {
  stopTone();

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  const gainNode = audioCtx.createGain();

const volume = parseFloat(document.getElementById('volume_row1').value);
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

	const interval = parseInt(document.getElementById('tempo_row1').value);

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


function showOverlay() {
  document.getElementById('overlayEffect').classList.add('show');
}
function hideOverlay() {
  document.getElementById('overlayEffect').classList.remove('show');
}

function closeFormAndOverlay() {
  document.getElementById('popupForm').style.display = 'none';
  document.getElementById('markerTitle').value = '';
  document.getElementById('markerText').value = '';
  stopLoop();
}

/*function stopAllLoops() {
  for (const rowId in loopIntervalId) {
    stopLoop(rowId);
  }
}*/

//MARKER-FUNKTIONEN

function submitMarker() {
  const title = document.getElementById('markerTitle').value;
  const text = document.getElementById('markerText').value;

  const selectedTone = document.querySelector('input[name="stimmung_row1"]:checked');
  const toneId = selectedTone ? selectedTone.value : null;

  const volume = parseFloat(document.getElementById('volume_row1').value);
  const tempo = parseInt(document.getElementById('tempo_row1').value);

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
    document.getElementById('modalTitle').innerText = marker.data.title;
    document.getElementById('modalText').innerText = marker.data.text;
    document.getElementById('myModal').style.display = 'block';

    if (marker.data && marker.data.toneId) {
      document.getElementById('volume_row1').value = marker.data.volume;
      document.getElementById('tempo_row1').value = marker.data.tempo;

      showOverlay();
      startLoop(tones[marker.data.toneId].freq);
    }
  });

  closeFormAndOverlay();
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
	const closeBtn = document.getElementById('closeModal');
	const modal = document.getElementById('myModal');
	closeBtn.addEventListener('click', function() {
		modal.style.display = 'none'; // PopUp schließen
	hideOverlay();
	//stopAllLoops();
		});
	
	window.addEventListener('click', function(event) {
		if (event.target === modal) {
			modal.style.display = 'none';
				hideOverlay();
	//stopAllLoops();
		}
	});
});

// Eventlistener für Radiobuttons, Loop starten
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

document.getElementById('tempo_row1').addEventListener('input', function () {
  const selectedTone = document.querySelector('input[name="stimmung_row1"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq);
  }
});

