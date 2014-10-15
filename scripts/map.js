/*----------------------------------------
 * BASIC MAP SETUP 
 *----------------------------------------*/ 
$j = jQuery; 

var startZoom = 5; 

L.mapbox.accessToken = 'pk.eyJ1IjoiY2phY2tzMDQiLCJhIjoiVFNPTXNrOCJ9.k6TnctaSxIcFQJWZFg0CBA';
var baseLayer = L.mapbox.tileLayer('cjacks04.jij42jel');
var map = new L.Map('map', {
	            center: new L.LatLng( 34, 34 ),
				zoom: startZoom,
				layers: [baseLayer],
				minZoom: 4,
				maxZoom: 11
});

/*----------------------------------------
 * ROUTES AND SITES LAYERS
 *----------------------------------------*/ 
var routeLayer = L.featureGroup(); 

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

/*-----------------------------------------------------
 * DIFFERENTIATE BETWEEN TOPTYPES
 * layerStyles: handles the formatting of the different
 * 	            circleMarkers. 
 * sitesLayer : currently, all sites are added to the siteLayer
 * 	 			but any layer can be passed in. 
 * addLayerForTopType( topTypes // some set of types, accessed
 *							       using sites[TOPTYPE]
 *					   layer // layer to add to map
 *					   styles // styling for circle marker)
 *					   noHide // true if label should always
 *								be present on the map
 *				  	   labelClass // styling for the label 
 *-----------------------------------------------------*/ 

var layerStyles = {
	"villages" : { color: '#e5f5f9', fillColor: '#e5f5f9', radius: 4, opacity: 0, fillOpacity: 1 }, 
	"towns" : {color: '#e5f5f9', fillColor: '#e5f5f9', radius: 4, opacity: 0, fillOpacity: 1}, 
	"capitals" : { color: '#99d8c9', fillColor: '#99d8c9', radius: 10, opacity: 0, fillOpacity: 1 }, 
	"metropoles" : { color: '#2ca25f', fillColor: '#2ca25f', radius: 15, opacity: 0, fillOpacity: 1 },
	"waystations" : { color: '#6F9690', fillColor: '#6F9690', radius: 2, opacity: 0, fillOpacity: 1 }, 
	"noCircle" : { color: '#fff', fillColor: '#fff', radius: 0, opacity: 0, fillOpacity: 0}
}


var farthestZoomSites = L.featureGroup(); 
var middleZoomSites = L.featureGroup(); 
var closestZoomSites = L.featureGroup(); 
var allSites = L.featureGroup(); 

addLayerForTopType(sites["sea"], farthestZoomSites, layerStyles["noCircle"], true, "leaflet-label-waters"); 
addLayerForTopType(sites["capitals"], farthestZoomSites, layerStyles["capitals"], false, "leaflet-label-city"); 
addLayerForTopType(sites["metropoles"], farthestZoomSites, layerStyles["metropoles"], true, "leaflet-label-city"); 

//sea, dark blue
//add in island, diff color
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
		allSites.addLayer(marker);   
	}); 
}

function createPopup(place) {
	return '<center><span class="arabic">' + place.arTitle + 
	'</span><br><span class="english">' + place.translitTitle + 
	'</span><br><b>Check in:</b> <a href="http://pleiades.stoa.org/search?SearchableText='+place.translitSimpleTitle+'" target="_blank">Pleiades</a>; <a href="https://en.wikipedia.org/wiki/Special:Search/'+place.translitSimpleTitle+'" target="_blank">Wikipedia</a></center>'
}

/* We need a function that gets called ON 'ZOOMED' SO THAT WE CHECK #ERRTIME*/
farthestZoomSites.addTo(map); 

map.on('zoomend', function() {
	if (map.getZoom() <= startZoom) {
		map.removeLayer(middleZoomSites);
		map.removeLayer(closestZoomSites); 
	} else if (map.getZoom() > startZoom && map.getZoom() < 8) {
		console.log("map zoom is ", map.getZoom()); 
		addLayerForTopType(sites["towns"], middleZoomSites, layerStyles["towns"], false, "leaflet-label-city"); 
		addLayerForTopType(sites["villages"], middleZoomSites, layerStyles["towns"], false, "leaflet-label-city"); 
		middleZoomSites.addTo(map); 
	}
	if (map.getZoom() === 8) {
		console.log("map zoom is 8")
		addLayerForTopType(sites["waystations"], closestZoomSites, layerStyles["waystations"], false, "lealet-label-city");
		middleZoomSites.addTo(map);
	}
}); 


var baseMaps = {
			"IMIW": baseLayer,
			};
			var overlayMaps = {
				"Routes": routeLayer,
				"All Sites": allSites, 
			};

L.control.layers( baseMaps, overlayMaps ).addTo( map );

$j( '#search input' ).on( 'keyup', function() {
	var matches = filterPlaces($j(this).val(), places.data, ['translitTitle','translitSimpleTitle','arTitle']);
	allSites.clearLayers();
	for ( var i=0, ii=matches.length; i<ii; i++ ) {
		allSites.addLayer(matches[i]); 
		allSites[matches[i]].openPopup();
	}
});

function filterPlaces( needle, sites, keys ) {
	// of the sites we want to represent on the map, 
	// search and show only marker for the places that match the query. 
}

