/**
 * Create a new Bing Maps layer.
 *
 * @param {string|object} options Either a [Bing Maps Key](https://msdn.microsoft.com/en-us/library/ff428642.aspx) or an options object
 * @param {string} options.BingMapsKey A valid Bing Maps Key (required)
 * @param {string} [options.imagerySet=Aerial] Type of imagery, see https://msdn.microsoft.com/en-us/library/ff701716.aspx
 * @param {string} [options.culture='en-US'] Language for labels, see https://msdn.microsoft.com/en-us/library/hh441729.aspx
 * @param {Boolean} [options.noAttribution=false] Disables adding attribution for this layer
 * @return {L.TileLayer} A Leaflet TileLayer to add to your map
 *
 * Create a basic map
 * @example
 * var map = L.map('map').setView([51.505, -0.09], 13)
 * L.TileLayer.Bing(MyBingMapsKey).addTo(map)
 */
L.TileLayer.Bing = L.TileLayer.extend({
  options: {
    bingMapsKey: null, // Required
    imagerySet: 'Aerial',
    culture: 'en-US',
    minZoom: 1,
    noAttribution: false
  },

  statics: {
    METADATA_URL: 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/{imagerySet}?key={bingMapsKey}&include=ImageryProviders&uriScheme=https',
    POINT_METADATA_URL: 'https://dev.virtualearth.net/REST/v1/Imagery/Metadata/{imagerySet}/{lat},{lng}?zl={z}&key={bingMapsKey}&uriScheme=https'
  },

  VALID_IMAGERY_SETS: ['Aerial', 'AerialWithLabels', 'Road'],

  initialize: function (options) {
    if (typeof options === 'string') {
      options = { bingMapsKey: options }
    }
    if (options && options.BingMapsKey) {
      options.bingMapsKey = options.BingMapsKey
      console.warn('use options.bingMapsKey instead of options.BingMapsKey')
    }
    if (!options || !options.bingMapsKey) {
      throw new Error('Must supply options.BingMapsKey')
    }
    options = L.setOptions(this, options)
    if (this.VALID_IMAGERY_SETS.indexOf(options.imagerySet) === -1) {
      throw new Error("'" + options.imagerySet + "' is an invalid imagerySet");
    }
    // Bing maps do not have zoom=0 tiles.
    options.minZoom = Math.max(1, options.minZoom)

    // Start initializing the Bing URL metadata asap so we're ready for Leaflet
    // to request tiles with `createTile`
    this._initMeta();

    // for https://github.com/Leaflet/Leaflet/issues/137
    if (!L.Browser.android) {
      this.on('tileunload', this._onTileRemove)
    }
  },

  /**
   * Sets a new Bing Maps API key. Resets the layer's tiles and requests new
   * tiles with the updated key.
   *
   * @param {String} newKey - A valid Bing Maps API key
   */
  setKey: function(newKey) {
    if (newKey && this.options.bingMapsKey !== newKey) {
      this.options.bingMapsKey = newKey;
      this._initMeta().then(function() {
        this.redraw();
      }.bind(this));
    }
  },

  /**
   * Sets a new imagery set for the the Bing tile layer. If the imagery set
   * is valid and different than the current imagery set, the layer's tiles
   * will be reset and new tiles will be requested.
   *
   * @param {String} newSet - The name of the new imagery set
   */
  setImagery: function(newSet) {
    if (!newSet || this.VALID_IMAGERY_SETS.indexOf(newSet) === -1) {
      throw new Error("'" + newSet + "' is an invalid imagerySet");
    }

    if (this.options.imagerySet !== newSet) {
      this.options.imagerySet = newSet;
      this._removeAllAttributions();
      this._initMeta().then(function() {
        this.redraw();
        this._updateAttribution();
      }.bind(this));
    }
  },

  /**
   * Sets a new culture (language) for the map. Resets the layer's tiles and
   * requests new tiles with the updated culture.
   *
   * @param {String} newCulture
   */
  setCulture: function(newCulture) {
    if (newCulture && this.options.culture !== newCulture) {
      this.options.culture = newCulture;
      this.redraw();
    }
  },

  /**
   * Enables adding attribution for the visible Bing Map tiles to the map.
   * Immediately adds attributions for the current visible tiles.
   */
  enableAttribution() {
    if (this.options.noAttribution) {
      this.options.noAttribution = false;
      this._updateAttribution();
    }
  },

  /**
   * Disables adding attribution for the visible Bing Map tiles to the map.
   * Clears any existing attributions from this layer.
   */
  disableAttribution() {
    if (!this.options.noAttribution) {
      this.options.noAttribution = true;
      this._removeAllAttributions();
    }
  },

  /**
   * Get the [Bing Imagery metadata](https://msdn.microsoft.com/en-us/library/ff701712.aspx)
   * for a specific [`LatLng`](http://leafletjs.com/reference.html#latlng)
   * and zoom level. If either `latlng` or `zoom` is omitted and the layer is attached
   * to a map, the map center and current map zoom are used.
   *
   * @param {L.LatLng} latlng
   * @param {Number} zoom
   * @return {Promise} Resolves to the JSON metadata
   */
  getMetaData: function (latlng, zoom) {
    if (!this._map && (!latlng || !zoom)) {
      return Promise.reject(new Error('If layer is not attached to map, you must provide LatLng and zoom'));
    }
    latlng = latlng || this._map.getCenter();
    zoom = zoom || this._map.getZoom();

    var PointMetaDataUrl = L.Util.template(L.TileLayer.Bing.POINT_METADATA_URL, {
      bingMapsKey: this.options.bingMapsKey,
      imagerySet: this.options.imagerySet,
      z: zoom,
      lat: latlng.lat,
      lng: latlng.lng
    });

    return fetch(PointMetaDataUrl)
      .then(function(response) {
        return response.json();
      })
      .catch(console.error.bind(console))
  },

  createTile: function (coords, done) {
    var tile = document.createElement('img');

    L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));

    if (this.options.crossOrigin) {
      tile.crossOrigin = '';
    }

    // Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
    // http://www.w3.org/TR/WCAG20-TECHS/H67
    tile.alt = '';

    // Don't create closure if we don't have to
    if (this._url) {
      tile.src = this.getTileUrl(coords);
    } else {
      this._initMeta()
        .then(function() {
          tile.src = this.getTileUrl(coords);
        }.bind(this))
        .catch(function(e) {
          console.error(e)
          done(e);
        });
    }

    return tile;
  },

  getTileUrl: function(coords) {
    var quadkey = this._toQuadKey(coords.x, coords.y, coords.z);
    return L.Util.template(this._url, {
      quadkey: quadkey,
      subdomain: this._getSubdomain(coords),
      culture: this.options.culture
    });
  },

  // Update the attribution control every time the map is moved
  onAdd: function(map) {
    map.on('moveend', this._updateAttribution, this);
    L.TileLayer.prototype.onAdd.call(this, map);
    this._updateAttribution();
  },

  // Clean up events and remove attributions from attribution control
  onRemove: function(map) {
    map.off('moveend', this._updateAttribution, this)
    this._removeAllAttributions(map);
    L.TileLayer.prototype.onRemove.call(this, map)
  },

  _initMeta: function() {
    var fetchPromise;
    if (this._fetchingMeta && this._fetch) {
      fetchPromise = this._fetch;
    } else {
      var boundFetch = this._startMetadataFetch.bind(this);
      fetchPromise = this._fetch = boundFetch();
    }
    return fetchPromise;
  },

  _startMetadataFetch: function() {
    this._fetchingMeta = true;
    this._url = null;
    this._imageryProviders = [];
    this._attributions = [];

    var metadataUrl = L.Util.template(L.TileLayer.Bing.METADATA_URL, {
      bingMapsKey: this.options.bingMapsKey,
      imagerySet: this.options.imagerySet
    });

    return fetch(metadataUrl)
      .then(function(response) {
        return response.json();
      })
      .then(this._handleMetadataLoaded.bind(this))
      .then(function() {
        this._fetchingMeta = false;
      }.bind(this))
      .catch(console.error.bind(console));
  },

  _handleMetadataLoaded: function(metadata) {
    if (metadata.statusCode !== 200) {
      throw new Error('Bing Imagery Metadata error: \n' + JSON.stringify(metadata, null, '  '))
    }
    var resource = metadata.resourceSets[0].resources[0]
    this._url = resource.imageUrl
    this._imageryProviders = this._reduceProviders(resource.imageryProviders);
    this.options.subdomains = resource.imageUrlSubdomains
    this._updateAttribution()
    return Promise.resolve()
  },

  /**
   * Takes an array of provider objects, each with a coverage area, and converts
   * it to an object with an array of providers and an array of coverage areas.
   *
   * @returns {Object}
   */
  _reduceProviders: function(providers) {
    var response = {
      providers: [],
      areas: []
    };

    var provider;
    var areaObj;
    var p, plen, a, alen;

    for (p=0, plen=providers.length; p<plen ;p++) {
      provider = providers[p];
      response.providers.push(provider);
      for (a=0,alen=provider.coverageAreas.length; a<alen; a++) {
        areaObj = {
          provider: provider,
          bounds: L.latLngBounds([provider.coverageAreas[a].bbox[0], provider.coverageAreas[a].bbox[1]], [provider.coverageAreas[a].bbox[2], provider.coverageAreas[a].bbox[3]]),
          zoomMin: provider.coverageAreas[a].zoomMin,
          zoomMax: provider.coverageAreas[a].zoomMax
        }
        response.areas.push(areaObj);
      }
    }

    return response;
  },

  /**
   * Update the attribution control of the map with the provider attributions
   * within the current map bounds
   */
  _updateAttribution: function () {
    var map = this._map;
    if (!map || !map.attributionControl) return;
    var zoom = map.getZoom();
    var bounds = map.getBounds();

    if (this._fetchingMeta) {
      this._initMeta().then(this._addAndRemoveAttributions.bind(this, map, bounds, zoom));
    } else {
      this._addAndRemoveAttributions(map, bounds, zoom);
    }
  },

  _addAndRemoveAttributions: function(map, bounds, zoom) {
    var nextAttrs = this._getAttributions(bounds, zoom);
    var prevAttrs = this._attributions;
    var i, len;

    // Add any new provider attributions in the current area to the attribution control
    for (i=0, len=nextAttrs.length; i<len; i++) {
      if (prevAttrs.indexOf(nextAttrs[i]) !== -1) continue;
      map.attributionControl.addAttribution(nextAttrs[i]);
    }

    // Remove any attributions that are no longer in the current area from the attribution control
    for (i=0, len=prevAttrs.length; i<len; i++) {
      if (nextAttrs.indexOf(prevAttrs[i]) !== -1) continue;
      map.attributionControl.removeAttribution(prevAttrs[i]);
    }

    this._attributions = nextAttrs;
  },

  /**
   * Returns an array of attributions for given bbox and zoom

   * @param {L.LatLngBounds} bounds Current map bounds
   * @param {Number} zoom Current map zoom
   * @return {Array} Array of attribution strings for each provider
   */
  _getAttributions: function (bounds, zoom) {
    // A providers bounds are an array `providers[i].coverageAreas[i].bbox[sw_lat, sw_lng, ne_lat, ne_lng]`
    if (this.options.noAttribution || typeof this._imageryProviders !== 'object' || !Array.isArray(this._imageryProviders.areas) || !bounds || !bounds.isValid() || !zoom) {
      return [];
    }

    var providers = [];
    var i = 0;
    var len = this._imageryProviders.areas.length;

    for (;i<len;i++) {
      if (!this._imageryProviders.areas[i].bounds && !this._imageryProviders.areas[i].bounds.isValid()) continue;

      if (providers.indexOf(this._imageryProviders.areas[i].provider.attribution) === -1 &&
          this._imageryProviders.areas[i].bounds.intersects(bounds) &&
          zoom >= this._imageryProviders.areas[i].zoomMin &&
          zoom <= this._imageryProviders.areas[i].zoomMax) {
        providers.push(this._imageryProviders.areas[i].provider.attribution);
      }
    }

    return providers;
  },

  _removeAllAttributions(map) {
    map = map || this._map
    if (!map || !Array.isArray(this._attributions) || !this._attributions.length) return;

    var i = 0;
    var len = this._attributions.length;
    for (; i<len; i++) {
      map.attributionControl.removeAttribution(this._attributions[i]);
    }

    this._attributions = [];
  },

  /**
   * Converts tile xyz coordinates to Quadkey
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @return {Number} Quadkey
   */
  _toQuadKey: function (x, y, z) {
    var index = ''
    for (var i = z; i > 0; i--) {
      var b = 0
      var mask = 1 << (i - 1)
      if ((x & mask) !== 0) b++
      if ((y & mask) !== 0) b += 2
      index += b.toString()
    }
    return index
  }
})

L.tileLayer.bing = function (options) {
  return new L.TileLayer.Bing(options)
}

// module.exports = L.TileLayer.Bing
