/* Pills */

document.getElementById('color').addEventListener('click', (e) => {
	document.body.classList.remove('color', 'customize');
	document.body.classList.add('color');
});

document.getElementById('customize').addEventListener('click', (e) => {
	document.body.classList.remove('color', 'customize');
	document.body.classList.add('customize');
});




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





/* Color swatches */

var controls = document.getElementById('colorView');

controls.addEventListener('mousedown', handleMouseEvent);
controls.addEventListener('touchstart', handleMouseEvent);

function handleMouseEvent(event) {
    if (event.target.tagName != 'BUTTON') {
        return;
    }
    
    var c = event.target.dataset.value;
	injectStyle(c);

    event.preventDefault();
}




/* Watch CSS animations */

var lastColor = '#cccccc';

var bulb = document.getElementById('bulb');

function watcher() {
	color = normalizeColor(window.getComputedStyle(bulb).fill);
	
	if (color != lastColor) {
		lastColor = color;
		BluetoothBulb.color = color;
	}
}
			
window.setInterval(watcher, 100);






/* Connect to device */

document.getElementById('connect')
	.addEventListener('click', () => {
		BluetoothBulb.connect()
			.then(() => {
				document.body.classList.add('connected');
				injectStyle(BluetoothBulb.color);
				
				BluetoothBulb.addEventListener('disconnected', () => {
					document.body.classList.remove('connected');
					injectStyle();
				});
			});
	});

document.getElementById('emulate')
	.addEventListener('click', () => {
	    emulateState = true;
		document.body.classList.add('connected');

		injectStyle();
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

