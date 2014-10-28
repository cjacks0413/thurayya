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
				minZoom: 3,
				zoomControl: true,
				maxZoom: 11
});

/*----------------------------------------
 * ROUTES AND SITES LAYERS
 *----------------------------------------*/ 
var routeLayer = L.featureGroup(); 

routeLayer.addLayer(L.geoJson(allRoutes)).addTo(map);

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
	"villages" : { color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 1 }, 
	"towns" : {color: '#6F9690', fillColor: '#6F9690', radius: 4, opacity: 0, fillOpacity: 1}, 
	"capitals" : { color: '#6F9690', fillColor: '#6F9690', radius: 10, opacity: 0, fillOpacity: 1 }, 
	"metropoles" : { color: '#6F9690', fillColor: '#6F9690', radius: 15, opacity: 0, fillOpacity: 1 },
	"waystations" : { color: '#6F9690', fillColor: '#6F9690', radius: 2, opacity: 0, fillOpacity: 1 }, 
	"noCircle" : { color: '#fff', fillColor: '#fff', radius: 0, opacity: 0, fillOpacity: 0}
}

var layers = []; 
var farthestZoomSites = L.featureGroup();
layers.push(farthestZoomSites); 
var capitalSites = L.featureGroup(); 
layers.push(capitalSites); 
var middleZoomSites = L.featureGroup(); 
layers.push(middleZoomSites);
var closestZoomSites = L.featureGroup(); 
layers.push(closestZoomSites);
var allSites = L.featureGroup(); 
layers.push(allSites); 
var tempSites = L.featureGroup(); 
layers.push(tempSites); 

addLayerForTopType(sites["sea"], farthestZoomSites, layerStyles["noCircle"], true, "leaflet-label-waters"); 
addLayerForTopType(sites["metropoles"], farthestZoomSites, layerStyles["metropoles"], true, "leaflet-label-city"); 
addLayerForTopType(sites["temp"], tempSites, layerStyles["waystations"], false, "leaflet-label-city"); 
addLayerForTopType(sites, allSites, layerStyles["noCircle"], false, "leaflet-label-search"); 


function addLayerForTopType(topTypes, layer, style, noHide, labelClass) {
	$j.each(topTypes, function(id, place) {
		var marker = L.circleMarker([place.lat, place.lon], style)
					  .bindLabel(place.arTitle, {
					  	noHide: noHide,
					    className: labelClass
					  })
					  .on('click', function() {
					  	this.bindPopup(createPopup(place, this)).openPopup(); 
					  }); 
		layer.addLayer(marker);
	}); 
}

function createPopup(place, marker) {
	var container = $j('<div />'); 
	container.on("click", function(e) {
		// generateContent(place)
		$j("#index-lookup-content").show(); 
		marker.closePopup(); 
	}); 
	container.append('<center><span class="arabic">' + place.arTitle + 
	'</span><br><span class="english">' + place.translitTitle + 
	'</span><br><b>Check in:</b> <a href="http://pleiades.stoa.org/search?SearchableText='+place.translitSimpleTitle+'" target="_blank">Pleiades</a>;<a href="https://en.wikipedia.org/wiki/Special:Search/'+place.translitSimpleTitle+'" target="_blank">Wikipedia</a>;<div id="index-lookup" class="basic"><a href="#">Tarikh al-Islam</a></div></center>');
	return container[0]; 
}

$j("#close").click(function(e){
	$j("#index-lookup-content").hide(); 
});

function generateContent(place) {
	// var results = lookup (place.arTitle/place.translitTitle) in index file
	// var content = $j("#index-lookup-content"); 
	// $j.each(results, function (id, result) {
	//	content.append("<br>"+result); 
	//});
}

farthestZoomSites.addTo(map); 


map.on('zoomend', function() {
	if (map.getZoom() < startZoom) {
		map.removeLayer(farthestZoomSites); 
	} else if (map.getZoom() == startZoom) {
		map.removeLayer(middleZoomSites);
		map.removeLayer(capitalSites); 
		map.removeLayer(closestZoomSites); 
	} else if (map.getZoom() == startZoom + 1) {
		addLayerForTopType(sites["capitals"], capitalSites, layerStyles["capitals"], false, "leaflet-label-city");
		map.removeLayer(middleZoomSites); 
		map.removeLayer(closestZoomSites); 
		capitalSites.addTo(map); 
	} else if (map.getZoom() > startZoom + 1 && map.getZoom() < 8) {
		addLayerForTopType(sites["towns"], middleZoomSites, layerStyles["towns"], false, "leaflet-label-city"); 
		addLayerForTopType(sites["villages"], middleZoomSites, layerStyles["towns"], false, "leaflet-label-city"); 
		capitalSites.addTo(map); 
		middleZoomSites.addTo(map); 
	} if (map.getZoom() === 8) {
		addLayerForTopType(sites["waystations"], closestZoomSites, layerStyles["waystations"], true, "lealet-label-city");
		capitalSites.addTo(map); 
		middleZoomSites.addTo(map);
	}
	
}); 




/*--------------------------------------------------------
 * SEARCH 
 *-------------------------------------------------------*/
$j( '#search input' ).on( 'keypress', function(e) {
	if (e.which === 13) {
		var query = $j(this).val().toUpperCase(); 
		var matches = filterPlaces($j(this).val(), places.data, ['translitTitle','translitSimpleTitle','arTitle']);
		clearLayers(); 
		for ( var i=0; i<matches.length; i++ ) {
			var m = L.circleMarker([matches[i].lat, matches[i].lon], layerStyles["capitals"])
						  .bindPopup(createPopup(matches[i], this))
						  .addTo(map);  
			m.openPopup(); 
		}
	}
});

function filterPlaces( query, sites, keys ) {
	var matches = []; 
	var query =  query.toUpperCase(); 
	for (var i = 0; i < sites.length; i++ ) {
		for (var j = 0; j < keys.length; j++ ) {
			var stack = sites[i][keys[j]].toUpperCase();
			if (stack.indexOf(query) != -1 ) {
				matches.push(sites[i]); 
			}
		}
	}
	return matches
}

function clearLayers() {
	for (var i = 0; i < layers.length; i++) {
		map.removeLayer(layers[i]);  
	}
}

/*---------------------------------------------------
 * REGION HIERARCHIES  
 *--------------------------------------------------*/

// frequency list for regions
var sitesByRegion = {}; 
$j.each( places.data, function(_id, _site) {
	if (sitesByRegion[_site.source] == undefined) {
		sitesByRegion[_site.source] = [];
		sitesByRegion[_site.source].push(_site); 
	} else {
		sitesByRegion[_site.source].push(_site); 
	}
}); 

var outerRegions = L.featureGroup(); 

createRegionalHierarchy(sitesByRegion, outerRegions, [], [36.862256, 18.303637], "region-outer"); 

function createRegionalHierarchy(places, layer, lines, center, regionClass) {
	$j.each(places, function(key, value) {
		//var average = averageCoordinates(value); 
		lines.push([center, [value[0].lat, value[0].lon]]) // should be average
	})
	layer.addLayer(L.multiPolyline(lines)
					.setStyle({ className: regionClass })); 
}


/*------------------------------------------------------
 * BASEMAP 
 *-----------------------------------------------------*/
var baseMaps = {
			"IMIW": baseLayer,
			};
			var overlayMaps = {
				"Routes": routeLayer,
				"Temp" : tempSites,  
				"Hierarchy" : outerRegions
			};

L.control.layers( baseMaps, overlayMaps ).addTo( map );

/*
 * UTIL 
 */ 

function averageCoordinates(coords) {
	var sumX = 0, sumY = 0, sumZ = 0; 
	var length = coords.length; 
	var lat, lon, hyp;  
	for (var i = 0; i < length; i++) {
		// convert to radians
		lat = coords[i].lat * Math.PI / 180; 
		lon = coords[i].lon * Math.PI / 180; 
		
		var x = Math.cos(lat) * Math.cos(lon); 
		var y = Math.cos(lat) * Math.sin(lon);
		var z = Math.sin(lat); 

		sumX += x; 
		sumY += y; 
		sumZ += z; 
	}

	sumX = sumX / length;
	sumY = sumY / length; 
	sumZ = sumZ / length; 

	lon = Math.atan2(sumY, sumX);
	hyp = Math.sqrt(sumX * sumX * sumY * sumY); 
	lat = Math.atan2(sumZ, hyp);

	return [ (lon * 180 / Math.PI), (lat * 180 / Math.PI)]; 
}




