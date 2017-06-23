

/* Inject styles in the editor */

var style = document.getElementById('style');

function injectStyle(c) {
	if (c) {
		style.innerHTML = 
			"#bulb {\n" + 
			"    fill: " + c + ";\n" +
			"}";
	}
	else {
		style.innerHTML = '';
	}
}








/* Color input field */
	
var field = document.getElementById('color');
field.addEventListener('change', function(e) {
    var c = e.target.value;
	injectStyle(c);
})








/* Watch CSS animations */

var lastColor = '#cccccc';

var bulb = document.getElementById('bulb');

function watcher() {
	color = normalizeColor(window.getComputedStyle(bulb).fill);
	
	if (color != lastColor) {
		lastColor = color;
		Playbulb.color = color;
	}
}
			
window.setInterval(watcher, 100);






/* Connect to device */

document.getElementById('connect')
	.addEventListener('click', () => {
		Playbulb.connect()
			.then(() => {
				document.body.classList.add('connected');
				injectStyle(Playbulb.color);
				
				Playbulb.addEventListener('disconnected', () => {
					document.body.classList.remove('connected');
					injectStyle();
				});
			});
	});

document.getElementById('emulate')
	.addEventListener('click', () => {
	    emulateState = true;
		document.body.classList.add('connected');
	});


	
	



/* Color format conversion */

function normalizeColor(rgb) {
	if (rgb.search("rgb") == -1) {
		return rgb;
	}
	else if (rgb == 'rgba(0, 0, 0, 0)') {
		return 'transparent';
	}
	else {
		rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
		
		function hex(x) {
		   return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
	}
}  

