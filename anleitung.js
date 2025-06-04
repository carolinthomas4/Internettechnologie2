document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('myModal');  
	const closeBtn = document.getElementById('closeModal');
  
	function openAnleitung() {   
		document.getElementById('modalTitle').innerText = "Willkommen bei Sound-Memories!";    
		document.getElementById('modalText').innerHTML =    
			'Rechtsklick auf die Karte, um eine neue Erinnerung mit Sound zu erstellen.<br><br>' +    
			'Schieberegler verändern Lautstärke und Tempo.<br><br>' +   
			'Klicke auf Marker, um Erinnerungen erneut abzuspielen.';   
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