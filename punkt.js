// VARIABLEN UND KONSTANTEN

//Punkt-Aussehen:)
const customIcon = L.icon({
	iconUrl: 'RoterPunkt.svg',  
    iconSize: [16, 16], 
	//iconAnchor: [8, 16],      // Wo Blase sitzt
    //popupAnchor: [0, -16]      // Wo Blase erscheint
});
	
let clickCoords; // Speichert Klickkoordinaten
let currentOscillator = {};
let loopIntervalId = {};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const oscillatorTypes = {
  row1: 'sine',
  row2: 'square',
  row3: 'triangle',
  row4: 'sawtooth'
};

const tones = {
  ton11: { freq: 523.25 },
  ton12: { freq: 392.00 },
  ton13: { freq: 349.23 },
  ton14: { freq: 659.25 },
  ton15: { freq: 277.18 },
  ton21: { freq: 330.00 },
  ton22: { freq: 440.00 },
  ton23: { freq: 554.37 },
  ton24: { freq: 698.46 },
  ton25: { freq: 784.00 },
  ton31: { freq: 523.25 },
  ton32: { freq: 392.00 },
  ton33: { freq: 349.23 },
  ton34: { freq: 659.25 },
  ton35: { freq: 277.18 },
  ton41: { freq: 330.00 },
  ton42: { freq: 440.00 },
  ton43: { freq: 554.37 },
  ton44: { freq: 698.46 },
  ton45: { freq: 784.00 }
};

//const extraTones = [
	//{ freqs: [523.25, 587.33, 659.25, 698.46, 783.99], type: 'sine' },
	//{ freqs: [261.63, 293.66, 329.63, 349.23, 392.00], type: 'square' },
	//{ freqs: [196.00, 220.00, 246.94, 261.63, 293.66], type: 'triangle' },
	//{ freqs: [523.25, 587.33, 659.25, 698.46, 783.99], type: 'sawtooth' },
//];

//HILFSFUNKTIONEN

function playTone(freq, rowId, duration = 300) {
  stopTone(rowId);

  const osc = audioCtx.createOscillator();
	osc.type = oscillatorTypes[rowId] || 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  const gainNode = audioCtx.createGain();

const volume = parseFloat(document.getElementById(`volume_${rowId}`).value);
gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();

  setTimeout(() => {
    osc.stop();
    osc.disconnect();
    gainNode.disconnect();
  }, duration);

  currentOscillator[rowId] = osc;
}

function startLoop(freq, rowId) {
  stopLoop(rowId); // Vorherigen Loop stoppen

	const interval = parseInt(document.getElementById(`tempo_${rowId}`).value);

  playTone(freq, rowId); // Direkt starten

  loopIntervalId[rowId] = setInterval(() => {
    playTone(freq, rowId);
  }, interval);
}

function stopTone(rowId) {
  if (currentOscillator[rowId]) {
    try {
      currentOscillator[rowId].stop();
    } catch(e) {
    }
    currentOscillator[rowId].disconnect();
    currentOscillator[rowId] = null;
  }
}

function stopLoop(rowId) {
  if (loopIntervalId[rowId]) {
    clearInterval(loopIntervalId[rowId]);
    loopIntervalId[rowId] = null;
  }
  stopTone(rowId);
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
  stopAllLoops();
}

function stopAllLoops() {
  for (const rowId in loopIntervalId) {
    stopLoop(rowId);
  }
}

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
  row1: {
    toneId: document.querySelector('input[name="stimmung_row1"]:checked')?.value || null,
    volume: parseFloat(document.getElementById('volume_row1').value),
    tempo: parseInt(document.getElementById('tempo_row1').value)
  },
  row2: {
    toneId: document.querySelector('input[name="stimmung_row2"]:checked')?.value || null,
    volume: parseFloat(document.getElementById('volume_row2').value),
    tempo: parseInt(document.getElementById('tempo_row2').value)
  },
	row3: {
    toneId: document.querySelector('input[name="stimmung_row3"]:checked')?.value || null,
    volume: parseFloat(document.getElementById('volume_row3').value),
    tempo: parseInt(document.getElementById('tempo_row3').value)
  },
  row4: {
    toneId: document.querySelector('input[name="stimmung_row4"]:checked')?.value || null,
    volume: parseFloat(document.getElementById('volume_row4').value),
    tempo: parseInt(document.getElementById('tempo_row4').value)
  }

};

  marker.on('click', function () {
    document.getElementById('modalTitle').innerText = marker.data.title;
    document.getElementById('modalText').innerText = marker.data.text;
    document.getElementById('myModal').style.display = 'block';

if (marker.data) {
  if (marker.data.row1.toneId) {
    document.getElementById('volume_row1').value = marker.data.row1.volume;
    document.getElementById('tempo_row1').value = marker.data.row1.tempo;
    startLoop(tones[marker.data.row1.toneId].freq, 'row1');
  }

  if (marker.data.row2.toneId) {
    document.getElementById('volume_row2').value = marker.data.row2.volume;
    document.getElementById('tempo_row2').value = marker.data.row2.tempo;
    startLoop(tones[marker.data.row2.toneId].freq, 'row2');
  }
	
	  if (marker.data.row3.toneId) {
    document.getElementById('volume_row3').value = marker.data.row3.volume;
    document.getElementById('tempo_row3').value = marker.data.row3.tempo;
    startLoop(tones[marker.data.row3.toneId].freq, 'row3');
  }

  if (marker.data.row4.toneId) {
    document.getElementById('volume_row4').value = marker.data.row4.volume;
    document.getElementById('tempo_row4').value = marker.data.row4.tempo;
    startLoop(tones[marker.data.row4.toneId].freq, 'row4');
  }
	

  showOverlay();
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
	stopAllLoops();
		});
	
	window.addEventListener('click', function(event) {
		if (event.target === modal) {
			modal.style.display = 'none';
				hideOverlay();
	stopAllLoops();
		}
	});
});

// Eventlistener für Radiobuttons, Loop starten
document.getElementById('radioTon11').addEventListener('click', () => {
  startLoop(tones.ton11.freq, 'row1');
});

document.getElementById('radioTon12').addEventListener('click', () => {
  startLoop(tones.ton12.freq, 'row1');
});

document.getElementById('radioTon13').addEventListener('click', () => {
  startLoop(tones.ton13.freq, 'row1');
});

document.getElementById('radioTon14').addEventListener('click', () => {
  startLoop(tones.ton14.freq, 'row1');
});

document.getElementById('radioTon15').addEventListener('click', () => {
  startLoop(tones.ton15.freq, 'row1');
});

// Eventlistener für Radiobuttons, Loop starten
document.getElementById('radioTon21').addEventListener('click', () => {
  startLoop(tones.ton21.freq, 'row2');
});

document.getElementById('radioTon22').addEventListener('click', () => {
  startLoop(tones.ton22.freq, 'row2');
});

document.getElementById('radioTon23').addEventListener('click', () => {
  startLoop(tones.ton23.freq, 'row2');
});

document.getElementById('radioTon24').addEventListener('click', () => {
  startLoop(tones.ton24.freq, 'row2');
});

document.getElementById('radioTon25').addEventListener('click', () => {
  startLoop(tones.ton25.freq, 'row2');
});

//reihe 3
document.getElementById('radioTon31').addEventListener('click', () => {
  startLoop(tones.ton11.freq, 'row3');
});

document.getElementById('radioTon32').addEventListener('click', () => {
  startLoop(tones.ton12.freq, 'row3');
});

document.getElementById('radioTon33').addEventListener('click', () => {
  startLoop(tones.ton13.freq, 'row3');
});

document.getElementById('radioTon34').addEventListener('click', () => {
  startLoop(tones.ton14.freq, 'row3');
});

document.getElementById('radioTon35').addEventListener('click', () => {
  startLoop(tones.ton15.freq, 'row3');
});

// Eventlistener für Radiobuttons, Loop starten
document.getElementById('radioTon41').addEventListener('click', () => {
  startLoop(tones.ton21.freq, 'row4');
});

document.getElementById('radioTon42').addEventListener('click', () => {
  startLoop(tones.ton22.freq, 'row4');
});

document.getElementById('radioTon43').addEventListener('click', () => {
  startLoop(tones.ton23.freq, 'row4');
});

document.getElementById('radioTon44').addEventListener('click', () => {
  startLoop(tones.ton24.freq, 'row4');
});

document.getElementById('radioTon45').addEventListener('click', () => {
  startLoop(tones.ton25.freq, 'row4');
});

document.getElementById('tempo_row1').addEventListener('input', function () {
  const selectedTone = document.querySelector('input[name="stimmung_row1"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq, 'row1');
  }
});
document.getElementById('volume_row2').addEventListener('input', () => {
  const selectedTone = document.querySelector('input[name="stimmung_row2"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq, 'row2');
  }
});

document.getElementById('tempo_row2').addEventListener('input', () => {
  const selectedTone = document.querySelector('input[name="stimmung_row2"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq, 'row2');
  }
});

document.getElementById('volume_row3').addEventListener('input', () => {
  const selectedTone = document.querySelector('input[name="stimmung_row3"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq, 'row3');
  }
});

document.getElementById('tempo_row3').addEventListener('input', () => {
  const selectedTone = document.querySelector('input[name="stimmung_row3"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq, 'row3');
  }
});

document.getElementById('volume_row4').addEventListener('input', () => {
  const selectedTone = document.querySelector('input[name="stimmung_row4"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq, 'row4');
  }
});

document.getElementById('tempo_row4').addEventListener('input', () => {
  const selectedTone = document.querySelector('input[name="stimmung_row4"]:checked');
  if (selectedTone) {
    const toneId = selectedTone.value;
    startLoop(tones[toneId].freq, 'row4');
  }
});

//Ton-aus-Buttons
document.getElementById('radioTon10').addEventListener('click', () => {
  stopLoop('row1');
});
document.getElementById('radioTon20').addEventListener('click', () => {
  stopLoop('row2');
});
document.getElementById('radioTon30').addEventListener('click', () => {
  stopLoop('row3');
});
document.getElementById('radioTon40').addEventListener('click', () => {
  stopLoop('row4');
});
