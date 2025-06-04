// VARIABLEN UND KONSTANTEN

//Karte, Marker
const customIcon = L.icon({
	iconUrl: 'RoterPunkt.svg',  
    iconSize: [16, 16], 
});

let clickCoords; // Speichert Klickkoordinaten
let currentOscillator = {};
let loopIntervalId = {};

//Audio
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

//Visuals
//Row1 Donut Torus
let animationFrameId;
let torusScene, torusCamera, torusRenderer, torusAnimationId;
let torusMesh;
let torusPhase = 0;
//Row2 Würfel
let cubeScene, cubeCamera, cubeRenderer, cubeAnimationId;
let cubeMeshes = [];
//Row3 Pyramiden
let pyramidScene, pyramidCamera, pyramidRenderer, pyramidAnimationId;
let pyramidMeshes = [];
let startTime = null;
//Row4 Spiralen
let spiralParticles1, spiralParticles2;
let spiralScene, spiralCamera, spiralRenderer, spiralAnimationId;
const loader = new THREE.TextureLoader();
const circleTexture = loader.load('https://threejs.org/examples/textures/sprites/disc.png'); 


//HILFSFUNKTIONEN 

//Formular
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
	resetForm();
}

function resetForm() {
	const radioGroups = document.querySelectorAll('.radio-group');  
	radioGroups.forEach(group => {    
		const radios = group.querySelectorAll('input[type="radio"]');    
		radios.forEach(radio => {      
			radio.checked = false;    
		}); 
	});
	
	const sliderContainers = document.querySelectorAll('.sliders');  
	sliderContainers.forEach(container => {    
		const sliders = container.querySelectorAll('input[type="range"]');    
		sliders.forEach(slider => {      
			if (slider.name === 'volume') {        
				slider.value = 0.1;      
			} else if (slider.name === 'tempo') {        
				slider.value = 700;      
			}    
		});  
	});
}

//Audio
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

//Visuals
//Row1 Donut
function initTorusCanvas() {
	const canvas = document.getElementById("torusCanvas");  
	torusRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });  
	torusRenderer.setSize(window.innerWidth, window.innerHeight);  
	torusScene = new THREE.Scene();  
	torusCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  
	torusCamera.position.z = 200;
	const light = new THREE.PointLight(0xffffff, 1);  
	light.position.set(200, 200, 200);  
	torusScene.add(light);
}

function createDistortedTorusGeometry(majorRadius, minorRadiusBase, minorAmplitude, frequency, phase, tubularSegments = 100, radialSegments = 30) {
	const geometry = new THREE.BufferGeometry();
	const positions = [];
	const normals = [];  
	const uvs = [];  
	const indices = [];
	
	for (let i = 0; i <= tubularSegments; i++) {
		const u = i / tubularSegments * 2 * Math.PI;
		for (let j = 0; j <= radialSegments; j++) {
			const v = j / radialSegments * 2 * Math.PI;      
			const modulatedMinorRadius = minorRadiusBase + minorAmplitude * Math.sin(frequency * u + phase);
      
			const x = (majorRadius + modulatedMinorRadius * Math.cos(v)) * Math.cos(u);     
			const y = (majorRadius + modulatedMinorRadius * Math.cos(v)) * Math.sin(u);
			const z = modulatedMinorRadius * Math.sin(v);      
			positions.push(x, y, z);
     	
			const nx = Math.cos(u) * Math.cos(v);     
			const ny = Math.sin(u) * Math.cos(v);      
			const nz = Math.sin(v);      
			normals.push(nx, ny, nz);
      
			uvs.push(i / tubularSegments, j / radialSegments);
		}
	}
	
	for (let i = 0; i < tubularSegments; i++) {    
		for (let j = 0; j < radialSegments; j++) {      
			const a = (radialSegments + 1) * i + j;      
			const b = (radialSegments + 1) * (i + 1) + j;      
			const c = (radialSegments + 1) * (i + 1) + j + 1;      
			const d = (radialSegments + 1) * i + j + 1;
      
			indices.push(a, b, d);      
			indices.push(b, c, d);
		}
	}
	
	geometry.setIndex(indices);
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));  
	geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));  
	geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));  
	geometry.computeVertexNormals();
	
	return geometry;
}

function drawDistortedTorus(freq, volume, tempo) {
	if (!torusScene) initTorusCanvas();
	const majorRadius = 60 + volume * 70;  
	const minorRadiusBase = 20;  
	const minorAmplitude = volume * 15;  
	const frequency = freq / 10;
	
	while (torusScene.children.length > 1) {
		torusScene.remove(torusScene.children[1]);
	}
	
	const material = new THREE.MeshBasicMaterial({    
		color: 0xffffff,    
		transparent: true,    
		opacity: 0.5,    
		wireframe: false,  
	});
	
	const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });  
	const geometry = createDistortedTorusGeometry(majorRadius, minorRadiusBase, minorAmplitude, frequency, torusPhase);  
	torusMesh = new THREE.Mesh(geometry, material);  
	const edges = new THREE.EdgesGeometry(geometry);
	const wireframe = new THREE.LineSegments(edges, lineMaterial);
	
	const group = new THREE.Group();
	group.add(torusMesh);
	group.add(wireframe);
	torusScene.add(group);
	
	const angularSpeed = 0.02 * (1000 / tempo);
	
	function animate() {    
		torusPhase += angularSpeed;
    
		const newGeom = createDistortedTorusGeometry(majorRadius, minorRadiusBase, minorAmplitude, frequency, torusPhase);   
		torusMesh.geometry.dispose();    
		torusMesh.geometry = newGeom;
		
		group.rotation.x += 0.01;   
		group.rotation.y += 0.02;
		
		torusRenderer.render(torusScene, torusCamera);    
		torusAnimationId = requestAnimationFrame(animate);
	}
	animate();
}

function stopDistortedTorus() {
	cancelAnimationFrame(torusAnimationId);
	if (torusRenderer) {    
		torusRenderer.clear();  
	}
}


//Row2 Würfel Cubes
function initCubesCanvas() {
	const canvas = document.getElementById("cubesCanvas");  
	cubeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });  
	cubeRenderer.setSize(window.innerWidth, window.innerHeight);  
	cubeScene = new THREE.Scene();  
	cubeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  
	cubeCamera.position.z = 200;  
	const light = new THREE.PointLight(0xffffff, 1);
	light.position.set(200, 200, 200);  
	cubeScene.add(light);
}

function drawCubes(freq, volume, interval, numberOfCubes = 6) {
	if (!cubeScene) initCubesCanvas();
	
	while (cubeScene.children.length > 1) {    
		cubeScene.remove(cubeScene.children[1]);  
	}
 
	cubeMeshes = [];  
	const spacing = 50;  
	const offset = -(numberOfCubes - 1) * spacing / 2;
  
	for (let i = 0; i < numberOfCubes; i++) {  
		const boxGeometry = new THREE.BoxGeometry(20, 20, 20);  
		const fillMaterial = new THREE.MeshBasicMaterial({    
			color: 0xff0000,    
			transparent: true,    
			opacity: 0.5 
		});  
		const cubeMesh = new THREE.Mesh(boxGeometry, fillMaterial);  
		const edges = new THREE.EdgesGeometry(boxGeometry);  
		const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });  
		const wireframe = new THREE.LineSegments(edges, lineMaterial);
  
		const group = new THREE.Group();  
		group.add(cubeMesh);  
		group.add(wireframe);  
		group.position.x = offset + i * spacing;  
		group.position.y = 0;
  		group.position.z = 0;
  
		group.userData = {    
			baseScale: 1,   
			volume,   
			freq, 
			interval,  
			phaseOffset: Math.random() * 2 * Math.PI  
		};

		cubeScene.add(group);
		cubeMeshes.push(group);
	}
	animateCubes();
}

function animateCubes() {
	const now = performance.now();
	cubeMeshes.forEach(cube => {
		const elapsed = now / cube.userData.interval;    
		const pulse = 1 + cube.userData.volume * 0.6 * Math.sin(elapsed * 2 * Math.PI + cube.userData.phaseOffset);    
		cube.scale.set(pulse, pulse, pulse);    
		cube.rotation.x += 0.01;    
		cube.rotation.y += 0.01;  
	});
	
	cubeRenderer.render(cubeScene, cubeCamera);
	cubeAnimationId = requestAnimationFrame(animateCubes);
}

function stopCubesAnimation() {
	cancelAnimationFrame(cubeAnimationId);
	if (cubeRenderer) {
		cubeRenderer.clear();
	}
}

//Row3 Pyramiden

function initPyramidsCanvas() {
	const canvas = document.getElementById("pyramidsCanvas");
	pyramidRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });  
	pyramidRenderer.setSize(window.innerWidth, window.innerHeight);  
	pyramidScene = new THREE.Scene();  
	pyramidCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	pyramidCamera.position.z = 300;  
	const light = new THREE.PointLight(0xffffff, 1);  
	light.position.set(200, 200, 200);  
	pyramidScene.add(light);
}

function drawPyramids(freq, volume, interval, numberOfPyramids = 10) {
	if (!pyramidScene) initPyramidsCanvas();
	
	while (pyramidScene.children.length > 1) {
		pyramidScene.remove(pyramidScene.children[1]);  
	}  
	pyramidMeshes = [];
	let material;  
	const spacing = 80;  
	const offset = -(numberOfPyramids - 1) * spacing / 2;
  
	for (let i = 0; i < numberOfPyramids; i++) {    
		const geometry = new THREE.TetrahedronGeometry(15);    
		const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });   
		const pyramid = new THREE.Mesh(geometry, material);    
		pyramid.position.x = offset + i * spacing;
    
		if (i % 2 === 0) {      
			pyramid.position.z = 50;     
			pyramid.scale.set(1.2, 1.2, 1.2);    
		} else {      
			pyramid.position.z = -50;      
			pyramid.scale.set(0.8, 0.8, 0.8);   
		}
		
		pyramid.position.y = 0;    
		pyramid.userData = {      
			baseY: pyramid.position.y,      
			volume,      
			freq,      
			interval,      
			phaseOffset: (i % 2 === 0) ? 0 : Math.PI    
		};
		
		pyramidScene.add(pyramid);    
		pyramidMeshes.push(pyramid);  
	}
	animatePyramids();
}

function animatePyramids(timestamp) {
	if (!startTime) startTime = timestamp;
	const elapsed = timestamp - startTime;
	const baseMovementHeight = 70;
	pyramidMeshes.forEach((pyramid, i) => {
		const { volume = 0, interval = 500 } = pyramid.userData;    
		const phase = ((elapsed % interval) / interval) * 2 * Math.PI;    
		const directionPhase = i % 2 === 0 ? 0 : Math.PI;    
		const yOffset = baseMovementHeight * Math.sin(phase + directionPhase);    
		pyramid.position.y = pyramid.userData.baseY + yOffset;    
		const baseScale = i % 2 === 0 ? 1.0 : 0.6;    
		const volumeScale = 1 + volume * 1.5;    
		const finalScale = baseScale * volumeScale;
		
		pyramid.scale.set(finalScale, finalScale, finalScale);    
		pyramid.rotation.x += 0.01;
		pyramid.rotation.y += 0.015;
	});
	pyramidRenderer.render(pyramidScene, pyramidCamera);
	pyramidAnimationId = requestAnimationFrame(animatePyramids);
}

function stopPyramidsAnimation() {
	cancelAnimationFrame(pyramidAnimationId);
	if (pyramidRenderer) {   
		pyramidRenderer.clear();  
	}
}

// ROW4 Spiralen

function initSpiralCanvas() {
	const canvas = document.getElementById("spiralsCanvas");
	spiralRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });  
	spiralRenderer.setSize(window.innerWidth, window.innerHeight);  
	spiralScene = new THREE.Scene();  
	spiralCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  
	spiralCamera.position.z = 200;  
	const light = new THREE.PointLight(0xffffff, 1);  
	light.position.set(200, 200, 200);  
	spiralScene.add(light);
}

function drawSpirals3D(freq, volume, interval) {
	if (!spiralScene) initSpiralCanvas();
	
	while (spiralScene.children.length > 1) {
		spiralScene.remove(spiralScene.children[1]);
	}
	  
	const numberOfParticles = 200;  
	const spiralRadius = 15 + volume * 30;  
	const spiralTurns = 3;  
	const spiralHeight = 80;
	
	function createSpiralPositions(offsetX = 0, offsetY = 0) {    
		const positions = new Float32Array(numberOfParticles * 3);    
		for (let i = 0; i < numberOfParticles; i++) {      
			const t = i / numberOfParticles;      
			const angle = spiralTurns * 2 * Math.PI * t;      
			const radiusMod = spiralRadius * (1 + 0.3 * Math.sin(8 * t + freq * 0.01));      
			const x = radiusMod * Math.cos(angle) + offsetX;      
			const y = spiralHeight * (t - 0.5) + offsetY;      
			const z = radiusMod * Math.sin(angle);      
			positions[i * 3] = x;      
			positions[i * 3 + 1] = y;      
			positions[i * 3 + 2] = z;    
		}    
		return positions;
	}

	const geometry1 = new THREE.BufferGeometry();
	geometry1.setAttribute('position', new THREE.BufferAttribute(createSpiralPositions(-80, -60), 3));

	const geometry2 = new THREE.BufferGeometry();
	geometry2.setAttribute('position', new THREE.BufferAttribute(createSpiralPositions(80, 60), 3));
  
	const material = new THREE.PointsMaterial({    
		color: 0xff0000,    
		size: 4 + volume * 2,    
		map: circleTexture,    
		sizeAttenuation: true,    
		transparent: true,    
		opacity: 0.8  
	});
  
	spiralParticles1 = new THREE.Points(geometry1, material);  
	spiralParticles1.userData = {
		rotationSpeed: (0.001 + (1000 / interval) * 0.0001) * 5,  
		baseX: -80,  
		baseY: -50,    
		direction: 1,    
		offset: 0
	};  
	spiralParticles2 = new THREE.Points(geometry2, material.clone());  
	spiralParticles2.userData = {    
		rotationSpeed: (0.001 + (1000 / interval) * 0.0001) * 5,  
		baseX: 80,  
		baseY: 50,
   		direction: -1,    
		offset: 0  
	};  
	spiralScene.add(spiralParticles1);  
	spiralScene.add(spiralParticles2);
	
	animateSpirals3D();
}

function animateSpirals3D() {
	if (spiralParticles1 && spiralParticles2) {
		spiralParticles1.rotation.y += spiralParticles1.userData.rotationSpeed;    
		spiralParticles1.rotation.x += spiralParticles1.userData.rotationSpeed * 0.5;    
		spiralParticles2.rotation.y += spiralParticles2.userData.rotationSpeed;    
		spiralParticles2.rotation.x += spiralParticles2.userData.rotationSpeed * 0.5;
		
		const oscillationAmplitude = 70;
		
		spiralParticles1.userData.offset += 0.01;
		spiralParticles1.position.x = spiralParticles1.userData.baseX + oscillationAmplitude * 
		Math.sin(spiralParticles1.userData.offset);
		spiralParticles1.position.y = spiralParticles1.userData.baseY + oscillationAmplitude * Math.cos(spiralParticles1.userData.offset);


		spiralParticles2.userData.offset += 0.01;
		spiralParticles2.position.x = spiralParticles2.userData.baseX + oscillationAmplitude * Math.sin(spiralParticles2.userData.offset + Math.PI);
		spiralParticles2.position.y = spiralParticles2.userData.baseY + oscillationAmplitude * Math.cos(spiralParticles2.userData.offset + Math.PI);
	}
	
	spiralRenderer.render(spiralScene, spiralCamera);
	spiralAnimationId = requestAnimationFrame(animateSpirals3D);
}
function stopSpiralAnimation() {
	cancelAnimationFrame(spiralAnimationId);  
	if (spiralRenderer) {    
		spiralRenderer.clear();  
	}
}

function stopAllVisuals(rowId) {
	if (rowId === 'row1') stopDistortedTorus();	
	if (rowId === 'row2') stopCubesAnimation();  
	if (rowId === 'row3') stopPyramidsAnimation();  
	if (rowId === 'row4') stopSpiralAnimation();
}

//FUNKTIONEN
function startLoop(freq, rowId) {
	stopLoop(rowId);	
	stopAllVisuals(rowId);
	
	const interval = parseInt(document.getElementById(`tempo_${rowId}`).value);
	const volume = parseFloat(document.getElementById(`volume_${rowId}`).value);
	
	playTone(freq, rowId);
	
	loopIntervalId[rowId] = setInterval(() => {    
		playTone(freq, rowId);  
	}, interval);
	
	if (rowId === 'row1') {  		
		drawDistortedTorus(freq, volume, interval);	 
	} else if (rowId === 'row2') {
  		drawCubes(freq, volume, interval);	 
	} else if (rowId === 'row3') {
  		 drawPyramids(freq, volume, interval);	 
	} else if (rowId === 'row4') {
  		drawSpirals3D(freq, volume, interval);	 
	}
}

function stopLoop(rowId) {  
	if (loopIntervalId[rowId]) {    
		clearInterval(loopIntervalId[rowId]);    
		loopIntervalId[rowId] = null;  
	}  
	stopTone(rowId);
}

function stopAllLoops() {  
	for (const rowId in loopIntervalId) {    
		stopLoop(rowId);	  
		stopAllVisuals(rowId);  
	}
}

//Marker Punkt

window.submitMarker = function() {
	const title = document.getElementById('markerTitle').value;  
	const text = document.getElementById('markerText').value;
  
	const selectedTone = document.querySelector('input[name="stimmung_row1"]:checked');  
	const toneId = selectedTone ? selectedTone.value : null;
	const volume = parseFloat(document.getElementById('volume_row1').value);  
	const tempo = parseInt(document.getElementById('tempo_row1').value);
  
	const marker = L.marker(clickCoords, { icon: customIcon }).addTo(map);
	
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
//Event Listener Ereignisse
map.on('contextmenu', function(e) {
	const form = document.getElementById('popupForm');
    if (form.style.display === 'block') {
		return;    	
	}	
	clickCoords = e.latlng;
	form.style.display = 'block';
});

document.addEventListener('keydown', function(e) {
	const formVisible = document.getElementById('popupForm').style.display === 'block';
	if (formVisible && e.key === 'Enter') {		
		e.preventDefault();
		submitMarker();		
	}
});

document.getElementById('closeFormBtn').addEventListener('click', closeFormAndOverlay);

document.addEventListener('DOMContentLoaded', function() {	
	const closeBtn = document.getElementById('closeModal');
	const modal = document.getElementById('myModal');
	
	closeBtn.addEventListener('click', function() {		
		modal.style.display = 'none';	
		hideOverlay();	
		stopAllLoops();		
		resetForm();		
	});
	window.addEventListener('click', function(event) {		
		if (event.target === modal) {			
			modal.style.display = 'none';				
			hideOverlay();	
			stopAllLoops();			
			resetForm();		
		}	
	});
});

//Zusammenfassung Radio Buttons
const toneMap = {  
	row1: ['ton11', 'ton12', 'ton13', 'ton14', 'ton15'],  
	row2: ['ton21', 'ton22', 'ton23', 'ton24', 'ton25'],  
	row3: ['ton11', 'ton12', 'ton13', 'ton14', 'ton15'],  
	row4: ['ton21', 'ton22', 'ton23', 'ton24', 'ton25'],
};

for (let row = 1; row <= 4; row++) { 
	for (let col = 1; col <= 5; col++) {    
		const buttonId = `radioTon${row}${col}`;    
		const toneKey = toneMap[`row${row}`][col - 1];    
		document.getElementById(buttonId).addEventListener('click', () => {      
			startLoop(tones[toneKey].freq, `row${row}`);    
		});  
	}
}

//Zusammenfassung Ton Aus Button
const stopActions = {  
	row1: stopDistortedTorus,  
	row2: stopCubesAnimation,
	row3: stopPyramidsAnimation,  
	row4: stopSpiralAnimation,
};

for (let row = 1; row <= 4; row++) {  
	const buttonId = `radioTon${row}0`;  
	const rowKey = `row${row}`;  
	document.getElementById(buttonId).addEventListener('click', () => {   
		stopLoop(rowKey);   
		stopActions[rowKey]();
	});
}

//Zusammenfassung Schieberegler
for (let row = 1; row <= 4; row++) {  
	['volume', 'tempo'].forEach(param => {    
		const elementId = `${param}_row${row}`;    		document.getElementById(elementId).addEventListener('input', () => {    
			const selectedTone = document.querySelector(`input[name="stimmung_row${row}"]:checked`);    
			if (selectedTone) {      
				const toneId = selectedTone.value;      
				startLoop(tones[toneId].freq, `row${row}`);    
			}   
		});	
	});
}

// Eventlistener für Radiobuttons, Loop starten
/*document.getElementById('radioTon11').addEventListener('click', () => {
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
});*/


/*document.getElementById('tempo_row1').addEventListener('input', function () {
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
});*/


//Ton-aus-Buttons alt
/*document.getElementById('radioTon10').addEventListener('click', () => {
  stopLoop('row1');
 stopDistortedTorus();
});
document.getElementById('radioTon20').addEventListener('click', () => {
  stopLoop('row2');
	stopCubesAnimation();
});
document.getElementById('radioTon30').addEventListener('click', () => {
  stopLoop('row3');
	stopPyramidsAnimation();
});
document.getElementById('radioTon40').addEventListener('click', () => {
  stopLoop('row4');
	stopSpiralAnimation();
});*/
//Ton aus Buttons vereinfacht
