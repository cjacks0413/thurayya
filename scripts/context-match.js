$j = jQuery; 
function loadMatches()  {
	console.log("loading matches...");
	$j("#context").load("./index.html #context-match"); 
}