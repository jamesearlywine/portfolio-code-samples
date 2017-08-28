  window.getGlobalGoogleMapsDeferred = $.Deferred();
  window.getGlobalGoogleMaps = window.getGlobalGoogleMapsDeferred.promise();
  function gmapCallback()
  {
    setTimeout(function() {
      window.getGlobalGoogleMapsDeferred.resolve();
    }, 100);
  }
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3' 
      + '&key=' + window.env.googleMapsJSAPIKey 
      + '&callback=gmapCallback'
  ;
  document.head.appendChild(script);  