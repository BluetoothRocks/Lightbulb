
(function() {
	'use strict';

	const PLAYBULB_NAME_PREFIX = 'PLAYBULB'
    const PLAYBULB_LIGHT_SERVICE = 0xff0f;
    const PLAYBULB_COLOR_CHARACTERISTIC = 0xfffc;


	class Playbulb {
		constructor() {
			this._EVENTS = {}
			this._SERVICE = null;
		}
		
		connect() {
            console.log('Requesting Bluetooth Device...');
            
            return new Promise((resolve, reject) => {
            
	            navigator.bluetooth.requestDevice({
		            filters: [
	                	{ namePrefix: PLAYBULB_NAME_PREFIX },
						{ services: [  PLAYBULB_LIGHT_SERVICE ] }
					]
				})
		            .then(device => {
		                console.log('Connecting to GATT Server...');
		
		                device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));
		                return device.gatt.connect();
		            })
		            .then(server => {
		                console.log('Getting Service...');
		                return server.getPrimaryService(PLAYBULB_LIGHT_SERVICE);
		            })
		            .then(service => {
		                this._SERVICE = service;
		                
		                console.log('Getting Characteristic...');
		                return service.getCharacteristic(PLAYBULB_COLOR_CHARACTERISTIC);
		            })
		            .then(characteristic => {
		                return characteristic.readValue()
		            })
					.then(data => {
		                this._COLOR = this._rgbToHex(data.getUint8(1), data.getUint8(2), data.getUint8(3));
						resolve();
		            })
		            .catch(error => {
		                console.log('Argh! ' + error);
						reject();
		            });			
			});
			
		}
		
		addEventListener(e, f) {
			this._EVENTS[e] = f;
		}

		isConnected() {
			return !! this._SERVICE;
		}
			
		get color() {
			return this._COLOR;
		}
		
		set color(c) {
            if (!this._SERVICE) return;

			this._COLOR = c;

            this._SERVICE.getCharacteristic(PLAYBULB_COLOR_CHARACTERISTIC)
	            .then(characteristic => {
					var buffer = new ArrayBuffer(4);
					var view = new DataView(buffer);
					view.setUint32(0, parseInt(c.substring(1), 16), false);
	                return characteristic.writeValue(buffer);
	            })
	            .catch(error => {
	                console.log('Argh! ' + error);
	            });
		}
			
		_disconnect() {
            console.log('Disconnected from GATT Server...');

			this._SERVICE = null;
			
			if (this._EVENTS['disconnected']) {
				this._EVENTS['disconnected']();
			}
		}

		_rgbToHex(red, green, blue) {
			var rgb = blue | (green << 8) | (red << 16);
			return '#' + (0x1000000 + rgb).toString(16).slice(1)
		}
	}

	window.Playbulb = new Playbulb();
})();

