# BluetoothBulb
Controlling a lightbulb with WebBluetooth


## What you need?

- [Mipow Playbulb Sphere](http://www.playbulb.com/en/playbulb-sphere.html) or a
  [Calex Bluetooth LED lamp](http://www.calex.nl/product/LEDNLE27A60-7W-2700BLUETOOTH-Let-op-Exclusief/)
- A browser that support WebBluetooth on your operating system


## How does this work?

The browser can connect to a Bluetooth LE device like the Playbulb Sphere using the WebBluetooth API. Each Bluetooth device has a number of services and characteristics. Think of them like objects with properties. Once connected to the device, the API then exposes these services and characteristics and you can read from and write to those characteristics. 

Most Bluetooth light bulbs exposes a number of services like controlling the light of the lamp. This service has a characteristic for the current color of the bulb. If you change this characteristic the color is then send from your computer wirelessly to the lightbulb which uses the values to change the actual color of the lamp. 

## But, how does the CSS animation work?

It's actually not that difficult. The animation is applied to the drawing of the lamp in the DOM. Every 100ms we check the current color using `getComputedStyle`. If the color changes, we send a command to the lightbulb. So the animation runs in the DOM and we get it almost for free.

## Why??

Because it's fun. And I got to play around with all kinds of new specifications like WebBluetooth, CSS Grids, Viewport units and SVG.
