/*----------------------------------------
 * BASIC MAP SETUP 
 *----------------------------------------*/ 
$j = jQuery; 
L.mapbox.accessToken = 'pk.eyJ1IjoiY2phY2tzMDQiLCJhIjoiVFNPTXNrOCJ9.k6TnctaSxIcFQJWZFg0CBA';
var baseLayer = L.mapbox.tileLayer('cjacks04.jij42jel');
var map = new L.Map('map', {
	            center: new L.LatLng( 34, 34 ),
				zoom: 5,
				layers: [baseLayer],
				minZoom: 3,
				maxZoom: 11
});

/*----------------------------------------
 * ROUTES AND SITES LAYERS
 *----------------------------------------*/ 
var routeLayer = L.layerGroup(); 
	routeLayer.addLayer(L.geoJson(allRoutes)); 



/*-----------------------------------------
 * FREQUENCY LIST/DICTIONARY FOR TOPTYPES
 *-----------------------------------------*/

var sites = {}; 
	$j.each( places.data, function(_id, _site) {
		if (sites[_site.topType] == undefined) {
			sites[_site.topType] = [];
			sites[_site.topType].push(_site); 
		} else {
			sites[_site.topType].push(_site); 
		}
	}); 
 
/*------------------------------------------
 * DIFFERENTIATE BETWEEN TOPTYPES
 *------------------------------------------*/ 
var layerStyles = {
	"capitals" : { color: '#6F9690', fillColor: '#6F9690', radius: 8, opacity: 0, fillOpacity: .8 }, 
	"metropoles" : {color: '#6F9690', fillColor: '#6F9690', radius: 15, opacity: 0, fillOpacity: 1}, 
	"towns" : { color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 1 }, 
	"villages" : { color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 1 },
	"temp" : { color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 0 } 
}


/*some variation on this loop...*/ 
//var style; 
// for (var key in sites) {
// 	style = layerStyles[key]; 
// 	if (style != undefined) {
// 		addMarkerForTopType(sites[key], style); 
// 	}
// };


var sitesLayer = L.layerGroup(); 
var staticSitesLayer = L.layerGroup(); 

/* TEMP FIX */ 
//addMarkerForTopType(sites["metropoles"], layerStyles["metropoles"]);
//addMarkerForTopType(sites["capitals"], layerStyles["capitals"]); 

addLayerForTopType(sites["capitals"], sitesLayer, layerStyles["capitals"], false, "leaflet-label-city"); 
addLayerForTopType(sites["metropoles"], sitesLayer, layerStyles["metropoles"], true, "leaflet-label-city"); 
addLayerForTopType(sites["sea"], sitesLayer, layerStyles["temp"], true, "leaflet-label-waters"); 
addLayerForTopType(sites["towns"], sitesLayer, layerStyles["towns"], false, "leaflet-label-city"); 

function addLayerForTopType(topTypes, layer, style, noHide, labelClass) {
	$j.each(topTypes, function(id, place) {
		var marker = L.circleMarker([place.lat, place.lon], style)
					  .bindLabel(place.arTitle, {
					  	noHide: noHide,
					    className: labelClass
					  })
					  .on('click', function() {
					  	this.bindPopup(createPopup(place)).openPopup(); 
					  });
		layer.addLayer(marker); 
	}); 
}

function createPopup(place) {
	return '<center><span class="arabic">' + place.arTitle + 
	'</span><br><span class="english">' + place.translitTitle + 
	'</span><br><b>Check in:</b> <a href="http://pleiades.stoa.org/search?SearchableText='+place.translitSimpleTitle+'" target="_blank">Pleiades</a>; <a href="https://en.wikipedia.org/wiki/Special:Search/'+place.translitSimpleTitle+'" target="_blank">Wikipedia</a></center>'
}

var baseMaps = {
			"IMIW": baseLayer,
			};
			var overlayMaps = {
				"Routes": routeLayer,
				"Sites": sitesLayer
			};

L.control.layers( baseMaps, overlayMaps ).addTo( map );


