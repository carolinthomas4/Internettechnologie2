document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('myModal');  
	const closeBtn = document.getElementById('closeModal');
  
	function openAnleitung() {   
		document.getElementById('modalTitle').innerText = "Willkommen bei Sound-Memories!";    
		document.getElementById('modalText').innerHTML =
			'Im Laufe des Studiums sammelt man viele verschiedene Erinnerungen - von schönen Momenten mit Freunden bis hin zu stressigen Prüfungen. Hier hast du die Möglichkeit diese zu verorten, zu sammeln und zu teilen. Der Clue? Du kannst das ganze mit individuellen Sounds untermalen. Anschließend werden dir passend zu den Sounds auch Visuals generiert. Lass dich einfach überraschen! <br><br>' +
			
			'Mit einem Rechtsklick auf die Karte erstellst du eine neue Erinnerung.<br>' +    
			'Mit den Schiebereglern kannst du die Töne ganz nach deinem Empfinden anpassen.<br>' +   
			'Klickst du wieder auf den Marker, kannst du deine Erinnerungen erneut abzuspielen.<br><br>'+
			'Probier es einfach selbst aus. Viel Spaß!'; 
		
		modal.style.display = 'block';
	}
	closeBtn.addEventListener('click', function() {    
		modal.style.display = 'none';  
	});  
	window.addEventListener('click', function(event) {    
		if (event.target === modal) {     
			modal.style.display = 'none';    
		} 
	});
	openAnleitung();
});