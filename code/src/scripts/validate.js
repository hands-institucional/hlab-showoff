var agent = window.navigator.userAgent.toLowerCase();
var isCriOS = agent.indexOf('crios') !== -1;
var iOSregExp = /([iphone|ipad]+)\;.*os\s([0-9][0-9]?\_\d(\_\d)?)/g;
var isiOS = false;
var iOSVersion = null;
agent.replace(iOSregExp, function(match, model, version) {
	isiOS = !!model;
	iOSVersion = version.split("_");
});

var isLt11_2iOS = isiOS && (iOSVersion[0] < 11 ? true : (iOSVersion[1] < 2))

if(isLt11_2iOS) {
	document.body.innerHTML = "<p>Este sistema não possui os requisitos necessários para esta aplicação.</p>"
}

else if(isCriOS) {
	document.body.innerHTML = "<p>Em dispositivos iOS, utilize o navegador Safari.</p>";
}

else {
	createMaterial();
}