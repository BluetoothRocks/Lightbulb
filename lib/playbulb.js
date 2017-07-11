
(function() {
	'use strict';

	const PLAYBULB_NAME_PREFIX = 'PLAYBULB'
    const PLAYBULB_LIGHT_SERVICE = 0xff0f;
    const PLAYBULB_COLOR_CHARACTERISTIC = 0xfffc;

	const CALEX_NAME_PREFIX = 'iLedBlub';
	const CALEX_LIGHT_SERVICE = 0xcc02;
	const CALEX_COLOR_CHARACTERISTIC = 0xee03;


	class Playbulb {
		constructor() {
			this._EVENTS = {}
			this._SERVICE = null;
			this._TYPE = '';
		}
		
		connect() {
            console.log('Requesting Bluetooth Device...');
            
            return new Promise((resolve, reject) => {
            
	            navigator.bluetooth.requestDevice({
		            filters: [
	                	{ namePrefix: CALEX_NAME_PREFIX },
	                	{ namePrefix: PLAYBULB_NAME_PREFIX }
					],
					
					optionalServices: [
						PLAYBULB_LIGHT_SERVICE, CALEX_LIGHT_SERVICE
					]
				})
		            .then(device => {
		                console.log('Connecting to GATT Server...');
		                
		                if (device.name == CALEX_NAME_PREFIX) {
			                this._TYPE = 'CALEX';
			                this._SERVICE_UUID = CALEX_LIGHT_SERVICE;
			                this._CHARACTERISTIC_UUID = CALEX_COLOR_CHARACTERISTIC;
		                } else {
			                this._TYPE = 'PLAYBULB';
			                this._SERVICE_UUID = PLAYBULB_LIGHT_SERVICE;
			                this._CHARACTERISTIC_UUID = PLAYBULB_COLOR_CHARACTERISTIC;
		                }
		
		                device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));
		                return device.gatt.connect();
		            })
		            .then(server => {
		                console.log('Getting Service...');
		                return server.getPrimaryService(this._SERVICE_UUID);
		            })
		            .then(service => {
		                this._SERVICE = service;
		                
		                console.log('Getting Characteristic...');
		                return service.getCharacteristic(this._CHARACTERISTIC_UUID);
		            })
		            .then(characteristic => {
			            if (this._TYPE != 'CALEX') {
			                return characteristic.readValue()
			            }
		            })
					.then(data => {
			            this._COLOR = "#ffffff";

						if (data) {
		                	this._COLOR = this._rgbToHex(data.getUint8(1), data.getUint8(2), data.getUint8(3));
		                }
		                
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
		
		set color(color) {
            if (!this._SERVICE) return;

			this._COLOR = color;

            this._SERVICE.getCharacteristic(this._CHARACTERISTIC_UUID)
	            .then(characteristic => {
		            
		            var c = parseInt(color.substring(1), 16);
				    var r = (c >> 16) & 255;
				    var g = (c >> 8) & 255;
				    var b = c & 255;

		            if (this._TYPE  == 'CALEX') {
			            var buffer = new Uint8ClampedArray([
				            0x01, g, 0x01, 0x00, 0x01, b, 0x01, r, 0x01, 0x00 
			            ]);
		            }
		            else {
			            var buffer = new Uint8ClampedArray([
				            0x00, r, g, b 
			            ]);
	                }

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

