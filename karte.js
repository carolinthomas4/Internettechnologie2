// Bildgröße (px)
const imageWidth = 1838.93; 
const imageHeight = 1722.14; 

const map = L.map('map', {        	
	crs: L.CRS.Simple,
	minZoom: 0,                
	maxZoom: 5,               
	zoomSnap: 0.5        	
});

map.attributionControl.setPrefix('');  
map.zoomControl.remove();

const southWest = map.unproject([0, imageHeight], map.getMaxZoom());    	
const northEast = map.unproject([imageWidth, 0], map.getMaxZoom());
const bounds = new L.LatLngBounds(southWest, northEast);

L.imageOverlay('JadeHS_VonOben.svg', bounds).addTo(map);
map.fitBounds(bounds);    	
const minZoom = map.getZoom();    	
map.setMinZoom(minZoom);     	
map.setMaxZoom(10);     	
map.setMaxBounds(bounds);

const zoomLevel = map.getBoundsZoom(bounds, true);
map.setView(bounds.getCenter(), zoomLevel);