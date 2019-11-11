
(function() {
	'use strict';


	const BULBS = [

		/* Playbulb */
		{
			'filters':	[ { namePrefix: 'PLAYBULB' } ],
			'optionalServices':	[ 0xff00 ],

			'write':	{
				'service':			0xff00,
				'characteristic':	0xfffc,
				'format':			(r, g, b) => new Uint8Array([ 0x00, r, g, b  ])
			},
			
			'read': {
				'service':			0xff00,
				'characteristic':	0xfffc,
				'interpret':		(buffer) => new Object({ r: buffer.getUint8(1), g: buffer.getUint8(2), b: buffer.getUint8(3) })
			}
		},
		
		/* Playbulb */
		{
			'filters':	[ { namePrefix: 'PLAYBULB' } ],
			'optionalServices':	[ 0xff02 ],

			'write':	{
				'service':			0xff02,
				'characteristic':	0xfffc,
				'format':			(r, g, b) => new Uint8Array([ 0x00, r, g, b  ])
			},

			'read': {
				'service':			0xff02,
				'characteristic':	0xfffc,
				'interpret':		(buffer) => new Object({ r: buffer.getUint8(1), g: buffer.getUint8(2), b: buffer.getUint8(3) })
			}
		},

		/* Playbulb */
		{
			'filters':	[ { namePrefix: 'PLAYBULB' } ],
			'optionalServices':	[ 0xff0f ],

			'write':	{
				'service':			0xff0f,
				'characteristic':	0xfffc,
				'format':			(r, g, b) => new Uint8Array([ 0x00, r, g, b  ])
			},

			'read': {
				'service':			0xff0f,
				'characteristic':	0xfffc,
				'interpret':		(buffer) => new Object({ r: buffer.getUint8(1), g: buffer.getUint8(2), b: buffer.getUint8(3) })
			}
		},

		/* Calex & Maginon Smart LED */
		{
			'filters':	[ { namePrefix: 'LED' }, { namePrefix: 'Beken LED' }, { namePrefix: 'iLedBlub' } ],
			'optionalServices':	[ 0xcc02 ],

			'write':	{
				'service':			0xcc02,
				'characteristic':	0xee03,
				'format':			function(r, g, b) {
					return new Uint8Array([ 0x01, g, 0x01, 0x00, 0x01, b, 0x01, r, 0x01, 0x00  ]);
				}
			},

			/*
			'notify':	{
				'write':	{
					'service':			0xcc02,
					'characteristic':	0xee02,
					'payload':			new Uint8Array([ 0x71, 0x75, 0x69, 0x6e, 0x74, 0x69, 0x63 ])
				},

				'listen':	{
					'service':			0xcc02,
					'characteristic':	0xee01,
					'interpret':		function(buffer) {
						return { r: buffer.getUint8(7), g: buffer.getUint8(1), b: buffer.getUint8(5) }
					}
				}
			}
			*/
		},

		/* LeSenz */
		{
			'filters':	[ { namePrefix: 'B730'} ],
			'optionalServices':	[ 0xfff0 ],

			'write':	{
				'service':			0xfff0,
				'characteristic':	0xfff1,
				'format':			function(r, g, b) {
					var buffer = new Uint8Array([ 0xaa, 0x0a, 0xfc, 0x3a, 0x86, 0x01, 0x0d, 0x06, 0x01, r, g, b, 0x00, 0x00, (Math.random() * 1000) & 0xff, 0x55, 0x0d ]);

				    for (var i = 1; i < buffer.length - 2; i++) {
					    buffer[15] += buffer[i];
				    }

					return buffer;
				}
			}
		},

		/* Magic Blue */
		{
			'filters':	[ { namePrefix: 'LEDBLE' } ],
			'optionalServices':	[ 0xffe0, 0xffe5 ],

			'write':	{
				'service':			0xffe5,
				'characteristic':	0xffe9,
				'format':			function(r, g, b) {
					return new Uint8Array([ 0x56, r, g, b, 0x00, 0xf0, 0xaa ]);
				}
			},

			'notify':	{
				'write':	{
					'service':			0xffe5,
					'characteristic':	0xffe9,
					'payload':			new Uint8Array([ 0xef, 0x01, 0x77 ])
				},

				'listen':	{
					'service':			0xffe0,
					'characteristic':	0xffe4,
					'interpret':		function(buffer) {
						return { r: buffer.getUint8(6), g: buffer.getUint8(7), b: buffer.getUint8(8) }
					}
				}
			}
		},

		/* BLE LED control module */
		{
			'filters':	[ { namePrefix: 'ELK-' } ],
			'optionalServices':	[ 0xfff0 ],

			'write':	{
				'service':			0xfff0,
				'characteristic':	0xfff3,
				'format':			function(r, g, b) {
					return new Uint8Array([ 0x7e, 0x07, 0x05, 0x03, r, g, b, 0x00, 0xef ]);
				}
			}
		},

		/* Espruino demo */
		{
			'filters':	[ { namePrefix: 'Espruino Light' } ],
			'optionalServices':	[ 0xfffa ],

			'write':	{
				'service':			0xfffa,
				'characteristic':	0xfffb,
				'format':			function(r, g, b) {
					return new Uint8Array([ r, g, b ]);
				}
			},

			'read': {
				'service':			0xfffa,
				'characteristic':	0xfffb,
				'interpret':		function(buffer) {
					return { r: buffer.getUint8(0), g: buffer.getUint8(1), b: buffer.getUint8(2) }
				}
			}
		},	
	]


	class BluetoothBulb {
		constructor() {
			this._EVENTS = {}
			this._SERVER = null;

			this._BULB = null;
		}

		connect() {
            console.log('Requesting Bluetooth Device...');

            return new Promise((resolve, reject) => {
	            navigator.bluetooth.requestDevice({
		            filters: BULBS.map(i => i.filters).reduce((a, b) => a.concat(b)),
					optionalServices: BULBS.map(i => i.optionalServices).reduce((a, b) => a.concat(b))
				})
					.then(device => {
		                console.log('Connecting to GATT Server...');
						device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));
						return device.gatt.connect();
					})
		            .then(async server => {
						let filteredBulbs = BULBS.filter(item => {
							return item.filters.filter(filter => filter.namePrefix && server.device.name.indexOf(filter.namePrefix) === 0).length;
		                });

						for (const bulb of filteredBulbs) {
							let match = true;

							for (const service of bulb.optionalServices) {
								try {
									await server.getPrimaryService(service);
								}
								catch {
									match = false;
								}
							}

							if (match) {
								this._BULB = bulb;
								return server;
							}
						}
		            })
		            .then(server => {
		                this._SERVER = server;

						if (this._BULB.read || this._BULB.notify) {
							this._retrieveColor().then((c) => {
								this._COLOR = this._rgbToHex(c.r, c.g, c.b);
								resolve();
							})
						} else {
				            this._COLOR = "#ffffff";
							resolve();
						}
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
			return !! this._SERVER;
		}

		get color() {
			return this._COLOR;
		}

		set color(color) {
            if (!this._SERVER) return;

			this._COLOR = color;

		    this._SERVER.getPrimaryService(this._BULB.write.service)
		    	.then(service => {
			    	return service.getCharacteristic(this._BULB.write.characteristic)
		    	})
	            .then(characteristic => {
		            var c = parseInt(color.substring(1), 16);
				    var r = (c >> 16) & 255;
				    var g = (c >> 8) & 255;
				    var b = c & 255;

					var buffer = this._BULB.write.format(r, g, b);
	                return characteristic.writeValue(buffer);
	            })
	            .catch(error => {
	                console.log('Argh! ' + error);
	            });
		}

		_disconnect() {
            console.log('Disconnected from GATT Server...');

			this._SERVER = null;

			if (this._EVENTS['disconnected']) {
				this._EVENTS['disconnected']();
			}
		}

		_retrieveColor() {
			return new Promise((resolve, reject) => {
				if (this._BULB.read) {
					this._SERVER.getPrimaryService(this._BULB.read.service)
				    	.then(service => {
					    	return service.getCharacteristic(this._BULB.read.characteristic)
				    	})
			            .then(characteristic => {
				            return characteristic.readValue()
				        })
				        .then(data => {
					        resolve(this._BULB.read.interpret(data));
						})
				}

				if (this._BULB.notify) {
					this._SERVER.getPrimaryService(this._BULB.notify.listen.service)
				    	.then(service => {
					    	return service.getCharacteristic(this._BULB.notify.listen.characteristic)
				    	})
						.then(characteristic => {
							/* Start listening for status notifications */

							characteristic.addEventListener('characteristicvaluechanged', event => {
								resolve(this._BULB.notify.listen.interpret(event.target.value));
							});

							characteristic.startNotifications();

							/* Send playload to trigger status update */

							this._SERVER.getPrimaryService(this._BULB.notify.write.service)
						    	.then(service => {
							    	return service.getCharacteristic(this._BULB.notify.write.characteristic)
						    	})
					            .then(characteristic => {
									return characteristic.writeValue(this._BULB.notify.write.payload);
								})
					            .catch(error => {
					                console.log('Argh! ' + error);
					            });
						})
				}
			});
		}

		_rgbToHex(red, green, blue) {
			var rgb = blue | (green << 8) | (red << 16);
			return '#' + (0x1000000 + rgb).toString(16).slice(1)
		}
	}

	window.BluetoothBulb = new BluetoothBulb();
})();


