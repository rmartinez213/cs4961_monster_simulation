v1.0.2
==================
* Fix bug that keeps dead attributions around when dynamically switching between
  different imagery sets

v1.0.1
==================
* Fixes typo in boolean

v1.0.0
==================
* Makes all options - including the Bing Maps API Key, imagery set, etc., fully
dynamic with methods exposed to update them at runtime and re-render the layer.
* Removes browserify and shims from the repo, makes any shims "bring your own".
If you're targeting older browsers, you'll need to Polyfill the `fetch` and
`Promise` APIs.
* Adds an HTML imports root (`leaflet-bing-tiles.html`) to allow easy de-duped
importing of this module into projects using web components.

Pre-v1.0.0
==================
A great deal of this component was created by Gregor MacLennan and released under
the MIT license at https://github.com/gmaclennan/leaflet-bing-layer. The v1.0.0
release of this component is a fork that started at v3.1.0 of its predecessor.
