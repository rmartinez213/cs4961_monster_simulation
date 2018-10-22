# leaflet-bing-tiles

Creates a Leaflet (v1+) tile layer that can load tiles from the Bing Maps API service after authenticating with an API key.

Based on [leaflet-bing-layer](https://github.com/tomgasson/leaflet-bing-layer) by Gregor MacLennan.

Adds a few key features to its source:

* All layer options are fully dynamic (e.g. Bing Maps API key or imagery set). Options can be set when the layer is first initialized through the options object, and updated layer with methods.
* Removes browserify and all shims from the repo, makes any shims "bring your own". If you're targeting older browsers, you'll need to Polyfill the `fetch` and `Promise` APIs on your own before loading this module's code.
* Adds an HTML imports root (`leaflet-bing-tiles.html`) to allow easy de-duped importing of this module into projects using web components.

### Basic example

```html
<script src="leaflet/leaflet.js"></script>
<script src="leaflet-bing-tiles/leaflet-bing-tiles.js"></script>
<link ref="leaflet/leaflet.css"></link>

<button onclick="changeImagery">Change Bing Imagery</button>
<div id="map"></div>

<script>
  var map = L.map('map').setView([37.8012, -122.2583], 10);

  // You'll need a Bing Maps API Key. Get one and paste it here.
  var KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  // Configure your Bing tiles
  var options = {
    bingMapsKey: KEY,
    imagerySet: 'Road',
    culture: 'af'
  };

  // Create a Bing tile layer and add it to the map
  var bingTiles = L.tileLayer.bing(options);

  // When the button is clicked, switch out the imagery
  function changeImagery() {
    var newChoice = bingTiles.options.imagerySet === 'Road' ? 'Aerial' : 'Road';
    bingTiles.setImagery(newChoice);
  }
</script>
```

## API

### L.tileLayer.bing(bingMapsKey|options)

Creates a new Bing Maps layer. Must be provided with an API key or it won't draw any tiles.

If the constructor is called with an API key as a string, it will use the default options.

**Params**

* `options` `<Object>`
  * `options.bingMapsKey` `<String>`
  * `[options.imagerySet='Aerial']` `<String>` - Tile type, 'Aerial', 'AerialWithLabels', or 'Road'
  * `[options.culture='en-US']` `<String>` - Label language ([more info](https://msdn.microsoft.com/en-us/library/hh441729.aspx))
  * `[options.noAttribution=false]` `<Boolean>` - Disables attribution

**Example**

```js
// Creates a layer with default options using XXXXXXXXXXXXXX as the API key
L.tileLayer.bing('XXXXXXXXXXXXXX');

// Create a layer with some options
L.tileLayer.bing({
  bingMapsKey: 'XXXXXXXXXXXXXX',
  imagerySet: 'Road'
});
```

### layer.setKey(key)

Sets a new Bing Maps API key. Resets the layer's tiles and requests new tiles with the updated key.

**Params**

* `key` `<String>`

### layer.setImagery(imagery)

Sets a new imagery set for the the Bing tile layer. If the imagery set is valid and different than the current imagery set, the layer's tiles will be reset and new tiles will be requested.

**Params**

* `imagery` `<String>` - See constructor `options.imagerySet`

### layer.setCulture(culture)

Sets a new culture (language) for the map. Resets the layer's tiles and requests new tiles with the updated culture.

**Params**

* `culture` `<String>` - See constructor `options.culture`

### layer.enableAttribution()

Enables adding attribution for the visible Bing Map tiles to the map. Immediately adds attributions for the current visible tiles.

### layer.disableAttribution()

Disables adding attribution for the visible Bing Map tiles to the map. Clears any existing attributions from this layer.

### layer.getMetaData([latLng], [zoom])

Get the [Bing Imagery metadata](https://msdn.microsoft.com/en-us/library/ff701712.aspx) for a specific [`LatLng`](http://leafletjs.com/reference.html#latlng) and zoom level. If either `latlng` or `zoom` is omitted and the layer is attached to a map, the map center and current map zoom are used.

**Params**

* `latlng` `<L.LatLng>`
* `zoom` `<Number>`

### License

MIT

Copyright 2017 David Leonard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Based on code released by Gregor MacLennan and released under the MIT license at https://github.com/gmaclennan/leaflet-bing-layer.
