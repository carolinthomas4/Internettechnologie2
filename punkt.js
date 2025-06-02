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

const canvas = document.getElementById('sineCanvas');
const ctx = canvas.getContext('2d');
let animationFrameId;

const squaresCanvas = document.getElementById("squaresCanvas");
const squaresCtx = squaresCanvas ? squaresCanvas.getContext("2d") : null;
squaresCanvas.width = window.innerWidth;
squaresCanvas.height = window.innerHeight;

let squaresAnimationId;
const squares = [];
let pulseStartTime = null;

const trianglesCanvas = document.getElementById("trianglesCanvas");
const trianglesCtx = trianglesCanvas ? trianglesCanvas.getContext("2d") : null;
trianglesCanvas.width = window.innerWidth;
trianglesCanvas.height = window.innerHeight;

let trianglesAnimationId;
const triangles = [];
let trianglesPulseStartTime = null;

const spiralsCanvas = document.getElementById("spiralsCanvas");
const spiralsCtx = spiralsCanvas ? spiralsCanvas.getContext("2d") : null;

if (spiralsCanvas) {
  spiralsCanvas.width = window.innerWidth;
  spiralsCanvas.height = window.innerHeight;
}

let spiralsAnimationId;
let spirals = [];

//HILFSFUNKTIONEN AUDIO

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




//HILFSFUNKTIONEN VISUALS

//ROW1 Siuns
function drawSineCircle(freq, volume, tempo) {
  cancelAnimationFrame(animationFrameId);

  const size = 300;
  const width = canvas.width = size;
  const height = canvas.height = size;

  const centerX = width / 2;
  const centerY = height / 2;
	
  const baseRadius = 40 + volume * 70;  // je größer volume, desto größer der Basisradius
  const amplitude = volume * 20;
  const frequency = freq / 50;

  let angle = 0;
  const angularSpeed = 0.05 * (1000 / tempo);

  function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();

    for (let theta = 0; theta <= 2 * Math.PI; theta += 0.01) {
      const modRadius = baseRadius + amplitude * Math.sin(frequency * theta + angle);

      const x = centerX + modRadius * Math.cos(theta);
      const y = centerY + modRadius * Math.sin(theta);

      if (theta === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    angle += angularSpeed;
    animationFrameId = requestAnimationFrame(draw);
  }

  draw();
}

function stopSineWave() {
  cancelAnimationFrame(animationFrameId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//ROW2 Squares
function drawSquares(freq, volume, interval, numberOfSquares = 20) {
  squaresCanvas.width = window.innerWidth;
  squaresCanvas.height = window.innerHeight;

  squares.length = 0; // vorherige löschen

  // Beispiel: mehrere Quadrate mit Zufallspositionen
  //const numberOfSquares = 10;
  for (let i = 0; i < numberOfSquares; i++) {
    squares.push({
      x: Math.random() * squaresCanvas.width,
      y: Math.random() * squaresCanvas.height,
      baseSize: 20,
		volume: volume,
      //pulsePhase: Math.random() * 2 * Math.PI  // eigene Pulsphase
    });
  }

  pulseStartTime = null;
  animatePulsingSquares(interval);
}

function animatePulsingSquares(interval) {
  const now = performance.now();
  if (!pulseStartTime) pulseStartTime = now;

  const elapsed = now - pulseStartTime;

  squaresCtx.clearRect(0, 0, squaresCanvas.width, squaresCanvas.height);

  squares.forEach(sq => {
    // Puls mit eigener Phase berechnen:
    // Das sorgt dafür, dass jedes Quadrat in einer anderen Phase pulsiert
	   const pulseAmplitude = 1.2 * sq.volume;  
    const pulse = 1 + pulseAmplitude * Math.sin((elapsed / interval) * 2 * Math.PI);

    const size = sq.baseSize * pulse;
    const offset = (size - sq.baseSize) / 2;

    squaresCtx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    squaresCtx.fillRect(sq.x - offset, sq.y - offset, size, size);
  });

  squaresAnimationId = requestAnimationFrame(() => animatePulsingSquares(interval));
}


function stopSquaresAnimation() {
  cancelAnimationFrame(squaresAnimationId);
  if (squaresCtx) {
    squaresCtx.clearRect(0, 0, squaresCanvas.width, squaresCanvas.height);
  }
}

//ROW3 Dreiecke

function drawTriangles(freq, volume, interval, numberOfTriangles = 20) {
  trianglesCanvas.width = window.innerWidth;
  trianglesCanvas.height = window.innerHeight;

  triangles.length = 0; // vorherige löschen

  for (let i = 0; i < numberOfTriangles; i++) {
    triangles.push({
      x: Math.random() * trianglesCanvas.width,
      y: Math.random() * trianglesCanvas.height,
      baseSize: 20,
      volume: volume,
      rotation: Math.random() * 2 * Math.PI, // zufällige Rotation
		rotationSpeed: 1000 / interval * 0.01 
    });
  }
  animateRotatingTriangles(interval);
}

function drawTriangle(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -size / Math.sqrt(3)); // Obere Spitze (gleichseitiges Dreieck)
  ctx.lineTo(-size / 2, size / (2 * Math.sqrt(3)));
  ctx.lineTo(size / 2, size / (2 * Math.sqrt(3)));
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
  ctx.fill();
  ctx.restore();
}

function animateRotatingTriangles(interval) {
  const now = performance.now();
  if (!trianglesPulseStartTime) trianglesPulseStartTime = now;

  const elapsed = now - trianglesPulseStartTime;

  trianglesCtx.clearRect(0, 0, trianglesCanvas.width, trianglesCanvas.height);

  triangles.forEach(tri => {
    // Rotation erhöhen, hier abhängig von Geschwindigkeit (= interval)
    tri.rotation += tri.rotationSpeed; // Drehgeschwindigkeit (radians pro Frame)

    // Größe konstant, z.B. baseSize * volume (oder feste Größe)
    const size = tri.baseSize * (1 + 0.5 * tri.volume);

    drawTriangle(trianglesCtx, tri.x, tri.y, size, tri.rotation);
  });

  trianglesAnimationId = requestAnimationFrame(() => animateRotatingTriangles(interval));
}

function stopTrianglesAnimation() {
  cancelAnimationFrame(trianglesAnimationId);
  if (trianglesCtx) {
    trianglesCtx.clearRect(0, 0, trianglesCanvas.width, trianglesCanvas.height);
  }
}

//ROW4 Spirale

function drawSpiral(ctx, x, y, radius, turns, rotation, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();

  let angleStep = 0.1;
  let maxAngle = turns * 2 * Math.PI;

  for (let angle = 0; angle < maxAngle; angle += angleStep) {
    let r = radius * angle / maxAngle;
    let spiralX = r * Math.cos(angle);
    let spiralY = r * Math.sin(angle);
    if (angle === 0) {
      ctx.moveTo(spiralX, spiralY);
    } else {
      ctx.lineTo(spiralX, spiralY);
    }
  }

  ctx.strokeStyle = color || 'rgba(255, 0, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawSpirals(freq, volume, interval, tempo, numberOfSpirals = 10) {
  spiralsCanvas.width = window.innerWidth;
  spiralsCanvas.height = window.innerHeight;
 //const syncRotationSpeed = 0.01 * (1000 / freq);
  spirals = []; // vorherige löschen

  for (let i = 0; i < numberOfSpirals; i++) {
    spirals.push({
      x: Math.random() * spiralsCanvas.width,
      y: Math.random() * spiralsCanvas.height,
      baseRadius: 30 + Math.random() * 40,
      turns: 3 + Math.random() * 2,
      volume,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: 1000 / interval * 0.01 
    });
  }

  animateSpirals();
}

function animateSpirals() {
  spiralsCtx.clearRect(0, 0, spiralsCanvas.width, spiralsCanvas.height);

  for (let spiral of spirals) {
    spiral.rotation += spiral.rotationSpeed;
    let radius = spiral.baseRadius * (1 + spiral.volume); // Lautstärke-Reaktion

    drawSpiral(
      spiralsCtx,
      spiral.x,
      spiral.y,
      radius,
      spiral.turns,
      spiral.rotation
    );
  }

  spiralsAnimationId = requestAnimationFrame(animateSpirals);
}

function stopSpiralsAnimation() {
  cancelAnimationFrame(spiralsAnimationId);
  if (spiralsCtx) {
    spiralsCtx.clearRect(0, 0, spiralsCanvas.width, spiralsCanvas.height);
  }
}

//LOOPS

function startLoop(freq, rowId) {
  stopLoop(rowId);// Vorherigen Loop stoppen
	stopAllVisuals(rowId);
	
	const interval = parseInt(document.getElementById(`tempo_${rowId}`).value);
	const volume = parseFloat(document.getElementById(`volume_${rowId}`).value);


  playTone(freq, rowId); // Direkt starten

  loopIntervalId[rowId] = setInterval(() => {
    playTone(freq, rowId);
  }, interval);
	 if (rowId === 'row1') {
  		drawSineCircle(freq, volume, interval);
	 } else if (rowId === 'row2') {
  		drawSquares(freq, volume, interval);
	 } else if (rowId === 'row3') {
  		drawTriangles(freq, volume, interval);
	 } else if (rowId === 'row4') {
  		drawSpirals(freq, volume, interval);
	 }
}

function stopLoop(rowId) {
  if (loopIntervalId[rowId]) {
    clearInterval(loopIntervalId[rowId]);
    loopIntervalId[rowId] = null;
  }
  stopTone(rowId);
}

function stopAllVisuals(rowId) {
  if (rowId === 'row1') stopSineWave();
  if (rowId === 'row2') stopSquaresAnimation();
  if (rowId === 'row3') stopTrianglesAnimation();
  if (rowId === 'row4') stopSpiralsAnimation();
}


function stopAllLoops() {
  for (const rowId in loopIntervalId) {
    stopLoop(rowId);
	  stopAllVisuals(rowId);
  }
}

//OPTIK 

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
    // Hilfsfunktion, die die Werte prüft und setzt
    function handleRow(rowId) {
      const row = marker.data[rowId];
      if (row && row.toneId && tones[row.toneId] && tones[row.toneId].freq) {
        document.getElementById(`volume_${rowId}`).value = row.volume;
        document.getElementById(`tempo_${rowId}`).value = row.tempo;
        startLoop(tones[row.toneId].freq, rowId);
      } 
    }

    handleRow('row1');
    handleRow('row2');
    handleRow('row3');
    handleRow('row4');

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
 stopSineWave();
});
document.getElementById('radioTon20').addEventListener('click', () => {
  stopLoop('row2');
	stopSquaresAnimation();
});
document.getElementById('radioTon30').addEventListener('click', () => {
  stopLoop('row3');
	stopTrianglesAnimation();
});
document.getElementById('radioTon40').addEventListener('click', () => {
  stopLoop('row4');
	stopSpiralsAnimation();
});
