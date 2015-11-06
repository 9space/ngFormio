module.exports = function() {

  // The formio class.
  var Formio = require('formiojs')();

  // Return the provider interface.
  return {

    // Set the base URL for the formio API.
    setBaseUrl: function(url, _noalias) {
      Formio.setBaseUrl(url, _noalias);
    },
    setDomain: function(dom) {
      // Remove this?
    },
    cacheOfflineProject: function(url, path) {
      Formio.cacheOfflineProject(url, path);
    },
    $get: [
      '$rootScope',
      '$q',
      function(
        $rootScope,
        $q
      ) {

        // Wrap Formio.request's promises with $q so $apply gets called correctly.
        var request = Formio.request;
        Formio.request = function() {
          return $q.when(request.apply(Formio, arguments))
          .catch(function(error) {
            if (error === 'Unauthorized') {
              $rootScope.$broadcast('formio.unauthorized', error);
            }
            else if (error === 'Login Timeout') {
              $rootScope.$broadcast('formio.sessionExpired', error);
            }
            // Propagate error
            throw error;
          });
        };

        // Same with Formio.makeRequest.
        var makeRequest = Formio.prototype.makeRequest;
        Formio.prototype.makeRequest = function() {
          return $q.when(makeRequest.apply(this, arguments));
        };

        // Return the formio interface.
        return Formio;
      }
    ]
  };
};
