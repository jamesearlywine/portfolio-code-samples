window.env = {
  name: 'production',
  webserviceApiKey: '',
  omniture : {
    reportingEnabled: false,
    defaults : {
      section: 'sponsor-story',
      extension: null,
      showDevice: true,
      debugTransport: false
    }
  },
  googleMapsJSAPIKey: '',
  googleAnalytics: {
    UACode: '',
    domainName: 'indystardev.com'
  },
  facebook: {
    appId: '',
  },
};

/**
 * URL-specific Facebook App IDs
 */
window.facebookAppIDs = {
  'digital.indystar.com'  : '',
  'thefineryears.com'     : '',
  'fineryears.com'        : '',
};
for (var key in window.facebookAppIDs) {
  if (window.location.href.indexOf(key) !== -1) {
    window.env.facebook.appId = window.facebookAppIDs[key];
    break;
  }
}