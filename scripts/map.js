//------------------------------------------
// BASIC MAP SETUP
//------------------------------------------
L.mapbox.accessToken = 'pk.eyJ1IjoiY2phY2tzMDQiLCJhIjoiVFNPTXNrOCJ9.k6TnctaSxIcFQJWZFg0CBA';
var baseLayer = L.mapbox.tileLayer('cjacks04.jij42jel');
var map = new L.Map('map', {
	            center: new L.LatLng( 34, 34 ),
				zoom: 6,
				layers: [baseLayer],
				minZoom: 3,
				maxZoom: 11
});

//----------------------------------------
//ROUTES AND SITES LAYERS
//----------------------------------------
var routeLayer = L.layerGroup(); 
routeLayer = L.geoJson(allRoutes).addTo(map); 

$j = jQuery; 

//-----------------------------------------
//FREQUENCY LIST FOR TOPTYPES
//-----------------------------------------

var sites = {}; 
	$j.each( places.data, function(_id, _site) {
		if (sites[_site.topType] == undefined) {
			sites[_site.topType] = [];
			sites[_site.topType].push(_site); 
		} else {
			sites[_site.topType].push(_site); 
		}
	}); 
 
//------------------------------------------------------------
//  Build a layer for each type
//------------------------------------------------------------
var layerStyles = {
	"capitals" : { color: '#6F9690', fillColor: '#6F9690', radius: 15, opacity: 0, fillOpacity: 1 }, 
	"metropoles" : {color: '#6F9690', fillColor: '#6F9690', radius: 10, opacity: 0, fillOpacity: 1}, 
	"towns" : { color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 1 }, 
	"villages" : { color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 1 },
	"temp" : { color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 1 } 
}


/*some variation on this loop...*/ 
//var style; 
// for (var key in sites) {
// 	style = layerStyles[key]; 
// 	if (style != undefined) {
// 		addMarkerForTopType(sites[key], style); 
// 	}
// }; 

/* TEMP FIX */ 
addMarkerForTopType(sites["metropoles"], layerStyles["metropoles"]);
addMarkerForTopType(sites["capitals"], layerStyles["capitals"]); 

var sitesLayer = L.layerGroup(); 
function addMarkerForTopType(topTypes, style) {
	$j.each(topTypes, function (id, place) {
		var marker = L.circleMarker([place.lat, place.lon], style).on('mouseover', function() {
			this.bindPopup(place.arTitle)
				.openPopup(); 
		}).on('mouseout', function() {
			this.closePopup();
		});  
		sitesLayer.addLayer(marker); 
	}); 
}

var baseMaps = {
			"IMIW": baseLayer,
			};
			var overlayMaps = {
				"Routes": routeLayer,
				"Sites": sitesLayer
			};

L.control.layers( baseMaps, overlayMaps ).addTo( map );


