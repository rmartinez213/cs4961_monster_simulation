(function() {
  var PxAppRouteHelpers = {
    isDeepEqual: function(a1, a2) {
      if (!Array.isArray(a1) || !Array.isArray(a2)) return false;
      if (a1.length !== a2.length) return false;

      for (var i=0; i<a1.length; i++) {
        if (a1[i] !== a2[i]) {
          return false;
        }
      }
      return true;
    },

    encodeAllPaths: function(routes, options) {
      if (typeof routes !== 'object') return;

      options = options || {};
      var pathSegment = options.segmentPathsWith || '/';
      var modelSegment = options.segmentModelsWith || '~';
      var prefixFirstPath = typeof options.prefixFirstPath === 'boolean' ? options.prefixFirstPath : true;
      var path = '';

      if (Array.isArray(routes.navRoute) && routes.navRoute.length > 0) {
        path += this.encodePath(routes.navRoute, pathSegment, prefixFirstPath);
      }
      if (Array.isArray(routes.assetRoute) && routes.assetRoute.length > 0) {
        var assetPath = this.encodePath(routes.assetRoute, pathSegment, prefixFirstPath);
        if (assetPath.length > 0) {
          path += modelSegment + assetPath;
        }
      }

      return path;
    },

    encodePath: function(route, segmentWith, prefixFirstPath) {
      if (route && Array.isArray(route) && route.length > 0) {
        var path = route.join(segmentWith);
        return prefixFirstPath ? segmentWith + path : path;
      }
      return '';
    },

    decodePath: function(path, options) {
      options = options || {};
      var opts = {
        navRoute: options.hasOwnProperty('navRoute') ?
          options.navRoute : false,
        assetRoute: options.hasOwnProperty('assetRoute') ?
          options.assetRoute : false,
        stripPrefix: options.hasOwnProperty('stripPrefix') ?
          options.stripPrefix : true,
        segmentPathsWith: options.segmentPathsWith || '/',
        segmentModelsWith: options.segmentModelsWith || '~'
      };

      return PxAppRouteHelpers._decodePath(path, opts.navRoute, opts.assetRoute, opts.stripPrefix, opts.segmentPathsWith, opts.segmentModelsWith);
    },

    _decodePath: function(path, updateNavRoute, updateAssetRoute, stripPrefix, segmentPathsWith, segmentModelsWith) {
      if (typeof path !== 'string' || !path.length) {
        return undefined;
      }

      var nav;
      var asset;
      var decoded = {};

      if (updateNavRoute && updateAssetRoute) {
        // If the `segmentModelsWith` character isn't present, we'll only
        // decode the nav route
        if (path.indexOf(segmentModelsWith) === -1) {
          nav = path;
        }
        else {
          nav = path.split(segmentModelsWith)[0];
          asset = path.split(segmentModelsWith)[1];
        }
      }
      else if (updateNavRoute) {
        nav = path;
      }
      else if (updateAssetRoute) {
        asset = path;
      }

      // Slice off preceding `/` or developer-defined segment character
      if (typeof nav === 'string' && stripPrefix && nav[0] === segmentPathsWith) {
        nav = nav.slice(1);
      }
      if (typeof asset === 'string' && stripPrefix && asset[0] === segmentPathsWith) {
        asset = asset.slice(1);
      }

      if (typeof nav === 'string' && nav.length > 0) {
        decoded.navRoute = nav.split(segmentPathsWith);
      }
      if (typeof asset === 'string' && asset.length > 0) {
        decoded.assetRoute = asset.split(segmentPathsWith);
      }

      return decoded;
    }
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = PxAppRouteHelpers;
  } else {
    window.PxApp = (window.PxApp || {});
    window.PxApp.RouteHelpers = (window.PxApp.RouteHelpers || PxAppRouteHelpers);
  }
})();
