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

let currentOscillator = {};  // Objekt, in dem key = rowCount (z.B. "row1"), value = aktueller Oscillator der Reihe
//let loopIntervalId = null;  // Für den Loop-Intervall
let rowCount = 2;
let loopIntervalId = {};

const tones = {
  ton11: { freq: 523.25 },
  ton12: { freq: 392.00 },
  ton13: { freq: 349.23 },
  ton14: { freq: 659.25 },
  ton15: { freq: 277.18 }
};

const extraTones = [
	{ freqs: [523.25, 587.33, 659.25, 698.46, 783.99], type: 'sine' },
	{ freqs: [261.63, 293.66, 329.63, 349.23, 392.00], type: 'square' },
	{ freqs: [196.00, 220.00, 246.94, 261.63, 293.66], type: 'triangle' },
	{ freqs: [523.25, 587.33, 659.25, 698.46, 783.99], type: 'sawtooth' },
];

//HILFSFUNKTIONEN

function stopLoop(rowId = 'row1') {
  if (loopIntervalId[rowId]) {
    clearInterval(loopIntervalId[rowId]);
    loopIntervalId[rowId] = null;
  }
  stopTone(rowId);
}

function stopAllLoops() {
  for (const rowId in loopIntervalId) {
    stopLoop(rowId);
  }
}
document.getElementById('addRadioRowBtn').addEventListener('click', () => {
	  if (rowCount >= 5) {
    alert("Du kannst maximal 4 Reihen hinzufügen.");
    return; // Funktion an dieser Stelle abbrechen, keine neue Reihe hinzufügen
  }
  const radioGroup = document.querySelector('.radio-group');

  // Erstelle neuen Container für Reihe
  const newRow = document.createElement('div');
  newRow.classList.add('radio-row');
  newRow.style.marginTop = '10px';

  // Hole Frequenz-Array für aktuelle Reihe
  // WICHTIG: Überprüfen, ob extraTones[rowCount - 1] existiert
  const toneData = extraTones[rowCount - 1];  // Objekt mit { freqs: [...], type: '...' }
  if (!toneData) {
    //console.warn(Keine Daten für rowCount=${rowCount});
    return; // Abbrechen, wenn keine Frequenzen für diese Reihe vorhanden sind
  }
  
  //console.log(Füge neue Reihe #${rowCount} hinzu mit Frequenzen:, toneData.freqs);

	
   stopAllLoops();

  // Erzeuge 5 Radio-Buttons für die Reihe
  for (let i = 1; i <= 5; i++) {
    const label = document.createElement('label');
    label.style.whiteSpace = 'nowrap';
    label.style.marginRight = '15px';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `stimmung_row${rowCount}`;
input.id = `radioRow${rowCount}_Ton${i}`;
input.value = `row${rowCount}_ton${i}`;
   

    label.appendChild(input);
label.append(` Ton ${i}`);

	  
	 const currentRowId = `row${rowCount}`;

    // Eventlistener für jeden Radiobutton
    input.addEventListener('click', () => {
      const freq = toneData.freqs[i - 1]; // Frequenz passend zum Button
      const type = toneData.type;         // Typ aus extraTones

      //console.log(Radiobutton clicked: Reihe ${rowCount}, Ton ${i}, freq=${freq}, type=${type});

      // AudioContext ggf. resumieren, falls pausiert (Browser-Schutz)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          startLoop(freq, type, currentRowId);
        });
      } else {
        startLoop(freq, type, currentRowId);
      }
    });

    newRow.appendChild(label);
  }

  // Füge neue Reihe an die Gruppe an
  radioGroup.appendChild(newRow);

  // Erhöhe rowCount für nächste Reihe
  rowCount++;
});



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
	//hideOverlay();
	stopAllLoops();
}

function playTone(freq, type = 'sine', rowId = 'row1', duration = 300) {
  stopTone(rowId);

  const osc = audioCtx.createOscillator();
  osc.type = type;
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

  currentOscillator[rowId] = osc;
}

function startLoop(freq, type = 'sine', rowId = 'row1') {
	//console.log(startLoop: freq=${freq}, type=${type}, rowId=${rowId});
  stopLoop(rowId); // Vorherigen Loop stoppen
	
const intervalSlider = document.getElementById('tempo');
const interval = parseInt(intervalSlider.value); // in ms

  playTone(freq, type, rowId); // Direkt starten

  loopIntervalId[rowId] = setInterval(() => {
    playTone(freq, type, rowId);
  }, interval);
}

function stopTone(rowId = 'row1') {
  if (currentOscillator[rowId]) {
    try {
      currentOscillator[rowId].stop();
    } catch(e) {
      // falls schon gestoppt
    }
    currentOscillator[rowId].disconnect();
    currentOscillator[rowId] = null;
  }
}


function stopLoop(rowId = 'row1') {
	  //console.log(stopLoop: rowId=${rowId});
  if (loopIntervalId[rowId]) {
    clearInterval(loopIntervalId[rowId]);
    loopIntervalId[rowId] = null;
  }
  stopTone(rowId);
}


//MARKER-FUNKTIONEN

function submitMarker() {
  const title = document.getElementById('markerTitle').value;
  const text = document.getElementById('markerText').value;

  const selectedTone = document.querySelector('input[name="stimmung_row1"]:checked');
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
    document.getElementById('modalTitle').innerText = marker.data.title;
    document.getElementById('modalText').innerText = marker.data.text;
    document.getElementById('myModal').style.display = 'block';

    if (marker.data && marker.data.toneId) {
      document.getElementById('volume').value = marker.data.volume;
      document.getElementById('tempo').value = marker.data.tempo;

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
  startLoop(tones.ton11.freq, 'sine', 'row1');
});

document.getElementById('radioTon12').addEventListener('click', () => {
  startLoop(tones.ton12.freq, 'sine', 'row1');
});

document.getElementById('radioTon13').addEventListener('click', () => {
  startLoop(tones.ton13.freq, 'sine', 'row1');
});

document.getElementById('radioTon14').addEventListener('click', () => {
  startLoop(tones.ton14.freq, 'sine', 'row1');
});

document.getElementById('radioTon15').addEventListener('click', () => {
  startLoop(tones.ton15.freq, 'sine', 'row1');
});

document.getElementById('tempo').addEventListener('input', function() {
  const speedValue = this.value;

  for (let i = 1; i <= rowCount; i++) {
    const radios = document.querySelectorAll(input[name="stimmung_row${i}"]);
    radios.forEach((radio, index) => {
      if (radio.checked) {
        let freq;
        let type;

        if (i === 1) {
          const toneKey = `ton1${index + 1}`;
          freq = tones[toneKey]?.freq;
          type = 'sine';
        } else {
          const toneData = extraTones[i - 2];
          freq = toneData?.freqs[index];
          type = toneData?.type;
        }

        if (freq && type) { 
          const rowId = `row${i}`;
          startLoop(freq, type, rowId);
        }
      }
    });
  }
});  