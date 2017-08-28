/* global angular, env, $ */

/**
 * @brief App Dependencies Injected
 */
window.app = angular.module('app', [
  // vendor items
  'ui.bootstrap',
  'ui.router',
  'ng-wrap',
  'ngAnimate',
  'ngMessages',
  'ngSanitize',
  'slick',
  'angular-google-analytics',
  'facebook',
  'ngMeta',
  'templates',
  
  // services
  'OmnitureService',
  'HistoryService',
  'RegionsService',
  'CommunitiesService', 
  'BrowserDetectionService',
  'MarkersService',
  'DummyDataService',
  'AuthService',
  'FavoritesService',
  'SortService',
  'FilterService',
  'EmailService',
  
  // directives
  'BusyAnimationDirective',
  'ComponentLoadingAnimationDirective',
  'AuthAlertDirective',
  'SiteHeaderDirective',
  'SiteFooterDirective',
  'CommunityMapDirective',
  'MapInfoWindowDirective',
  'TableListCommunityDirective',
  'MapListCommunityDirective',
  'myEnter',
  'ngRepeatFinished',
  
  // routables
  'app.home',
  'app.map',
  'app.saved',
  'app.care',
  'app.about',
  'app.home',
  'app.communities',
  'app.community',

  // modal controllers
  'app.modals.login',
  
  // filters
  'filter.telephone'
  
])

/**
 * @brief AppConfig
 */
.constant('AppConfig', {
  
  /**
   * Omniture Reporting 
   */
  omniture: window.env.omniture,
  
  /**
   * Webservices
   */
  webserviceApiKey: window.env.webserviceApiKey,
  
  /**
   * Communities Service
   */
  CommunitiesService: {
    endpoints: { // use cache endpoints
      // 'getCommunities'    : 'http://fineryearsdemo-webservice.indystardev.com//index.php/community',
      'getCommunities'    : window.env.name === 'development' 
                            ? 'http://fineryearsdemos3.indystardev.com/webserviceCache/community.json'
                            : 'http://indystar-thefineryears.s3.amazonaws.com/webserviceCache/community.json'
                          ,
      // 'getCitiesAndZips'  : 'http://fineryearsdemo-webservice.indystardev.com//index.php/communityCitiesAndZips',
      'getCitiesAndZips'    : window.env.name === 'development' 
                            ? 'http://fineryearsdemos3.indystardev.com.s3.amazonaws.com/webserviceCache/communityCitiesAndZips.json'
                            : 'http://indystar-thefineryears.s3.amazonaws.com/webserviceCache/communityCitiesAndZips.json'
                          ,
    },
    useDummyData: {
      communities: false
    }
  },
  
  /**
   * Auth Service
   */
  AuthService: { // use live endpoints
    guest: {
      endpoints: window.env.name === 'development' 
        ? {
            'whoami'        : 'http://fineryearsdemo-webservice.indystardev.com/guest/auth/whoami',
            'exists'        : 'http://fineryearsdemo-webservice.indystardev.com/guest/auth/exists/{email}',
            'register'      : 'http://fineryearsdemo-webservice.indystardev.com/guest/auth/register/{email}',
            'login'         : 'http://fineryearsdemo-webservice.indystardev.com/guest/auth/login/{email}',
            'registerLogin' : 'http://fineryearsdemo-webservice.indystardev.com/guest/auth/registerLogin/{email}',
            'logout'        : 'http://fineryearsdemo-webservice.indystardev.com/guest/auth/logout',
          }
        : {
            'whoami'        : 'http://digital.indystar.com/thefineryears/webservice/index.php/guest/auth/whoami',
            'exists'        : 'http://digital.indystar.com/thefineryears/webservice/index.php/guest/auth/exists/{email}',
            'register'      : 'http://digital.indystar.com/thefineryears/webservice/index.php/guest/auth/register/{email}',
            'login'         : 'http://digital.indystar.com/thefineryears/webservice/index.php/guest/auth/login/{email}',
            'registerLogin' : 'http://digital.indystar.com/thefineryears/webservice/index.php/guest/auth/registerLogin/{email}',
            'logout'        : 'http://digital.indystar.com/thefineryears/webservice/index.php/guest/auth/logout',
          }
      ,
      loginModalOptions: {
        animation   : true,
        windowClass : 'login-modal',
        templateUrl : 'app/modals/login/login.html',
        controller  : 'ModalLoginCtrl',
        openedClass : 'overflow-auto', // added to the body element when modal opened (misc.css .overflow-auto)
        size        : 'md',
        resolve     : {
					
        },
      },
      autoLoginAfterRegister: true
    },
  },
  
  /**
   * Favorites Service
   */
  FavoritesService : {
    endpoints: window.env.name === 'development' 
      ? {
          favorites    : 'http://fineryearsdemo-webservice.indystardev.com/guest/favorites',
        }
      : {
          favorites    : 'http://digital.indystar.com/thefineryears/webservice/guest/favorites',
        }
    ,
  },
  
  /**
   * Email Service
   */
  EmailService : {
    endpoints: { // use live endpoints
      communityRequestMoreInformation : 'http://fineryearsdemo-webservice.indystardev.com/emails/communityRequestMoreInformation/{communityId}',
    }
  },
   
  /**
   * Map Markers
   */
  MarkersService : {
    markerIcon : {
    	"path":"M 0,0 C -5,-25 -10,-19 -10,-30 A 10,10 0 1,1 10,-30 C 10,-19 5,-25 0,0 z",
    	"fillColor":"#038484",
    	"fillOpacity":1,
    	"strokeColor":"#93c8c8",
    	"strokeWeight":1,
    	"scale":1,
    	"labelOrigin": {x:0, y: -29}
    },
    markerLabel : {	
      color: 'white',
      fontFamily: 'Arial',
      fontSize: '11px',
      fontWeight: '400',
    },
    hoverMarkerIcon : {
    	"path":"M 0,0 C -5,-25 -10,-19 -10,-30 A 10,10 0 1,1 10,-30 C 10,-19 5,-25 0,0 z",
    	"fillColor":"#105363",
    	"fillOpacity":1,
    	"strokeColor":"#93c8c8",
    	"strokeWeight":2,
    	"scale":1.4,
    	"labelOrigin": {x:0, y: -29}
    },
    hoverMarkerLabel : {	
      color: 'white',
      fontFamily: 'Arial',
      fontSize: '13px',
      fontWeight: '400',
    },
    hoverEffectOnListItemHover  : true,
    hoverEffectOnMarkerHover    : true,
  },
  InfoWindows: {
    maxWidth: function() {
      var screenWidth = $(window).width();
      var maxInfoWindowWidth = 
              screenWidth > 1199  // if screenWidth > 1199
                ? 400             // then maxInfoWindowWidth = 500
            : screenWidth > 991
                ? 300
            : screenWidth > 767
                ? 300
            : screenWidth > 479
                ? 250
            : 250 // otherwise, maxInfoWindowWidth = 300
      ;
      return maxInfoWindowWidth;
    }
  },
  
  /**
   * Regions Service
   */
  regions: { 
    endpoints: { // use cache endpoints
      // 'getRegions'  : 'http://fineryearsdemo-webservice.indystardev.com//index.php/region'
       'getRegions'     : window.env.name === 'development' 
                          ? 'http://indystardev-thefineryears.s3.amazonaws.com/webserviceCache/region.json'
                          : 'http://indystar-thefineryears.s3.amazonaws.com/webserviceCache/region.json'
                        ,
    }
  },
  
  /**
   * Meta Data
   */
  Metadata : {
    defaultTitle        : 'The Finer Years - Retirement Living and Elder Care',
    defaultAuthor       : 'IndyStar',
    defaultDescription  : 'Welcome to The Finer Years - IndyStar\'s Guide to Retirement Living and Elder Care. This comprehensive, local resource will help you learn about the levels of retirement living and elder care..'
  },
  
  
  
})

/**
 * @brief Rootscope config
 */
.config([
  '$rootScopeProvider',
  function(
    $rootScopeProvider
  )
  {
    // digest cycle adjustment
    $rootScopeProvider.digestTtl(15);
  

  }
]) // end Rootscope config

/**
 * @brief Default Route / Routing Config
 */
// define default route
.config([   
  '$urlRouterProvider',
  '$locationProvider',
  function(
    $urlRouterProvider,
    $locationProvider
  ) 
  {
    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('');
    $urlRouterProvider.otherwise(function($injector, $location) {
      return '/';   
    });
    
  }
]) // end Routing Config

/**
 * Facebook
 */
.config([
  'FacebookProvider', 
  function(
    FacebookProvider
  ) 
  {
    FacebookProvider.init(window.env.facebook.appId);
  }
])


/**
 * Google Analytics
 * @note  https://github.com/revolunet/angular-google-analytics
 */
.config(['AnalyticsProvider', function (AnalyticsProvider) {
  
   AnalyticsProvider
    .setAccount(window.env.googleAnalytics.UACode)
    // Track all routes (default is true).
    .trackPages(true)
    // Track all URL query params (default is false).
    .trackUrlParams(true)
    // Ignore first page view (default is false).
    // Helpful when using hashes and whenever your bounce rate looks obscenely low.
    .ignoreFirstPageLoad(true)
    // Change the default page event name.
    // Helpful when using ui-router, which fires $stateChangeSuccess instead of $routeChangeSuccess.
    .setPageEvent('$stateChangeSuccess')
    // Set the domain name
    .setDomainName(window.env.googleAnalytics.domainName)
  ;

}])
.run([
    '$rootScope',
    'Analytics', 
  function(
    $rootScope,
    Analytics
  ) { 
    // global handle for debugging
    if (window.appDebug === undefined) {window.appDebug = {};}
    angular.extend(window.appDebug, {
      Analytics : Analytics
    });
    $rootScope.Analytics = Analytics;
}])


/**
 * MetaData
 * @note  https://github.com/vinaygopinath/ngMeta
 */
.config(['ngMetaProvider', 'AppConfig', function (ngMetaProvider, AppConfig) {

  ngMetaProvider
    // default title
    .setDefaultTitle(AppConfig.Metadata.defaultTitle)
    // default author
    .setDefaultTag('author', AppConfig.Metadata.defaultAuthor)
    // default descrpition
    .setDefaultTag('description', AppConfig.Metadata.defaultDescription)
  ;

}])
.run(['ngMeta', function(ngMeta) { 
  ngMeta.init();
}])




/**
 * @brief Angular Debug Info - disable for performance (we have our own appDebug anyway);
 */
.config(['$compileProvider', function ($compileProvider) {
  // disable debug info
  $compileProvider.debugInfoEnabled(false);
}])

/**
 * Misc Provider Config
 */
.config([
  '$qProvider',
  function(
    $qProvider  
  ) {
    $qProvider.errorOnUnhandledRejections(true);
  }
])

/**
 * $httpProvider config
 */
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}])
/**
 * $qProvider config
 */
.config(['$qProvider', function($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
}])

/**
 * @brief Rootscope Init
 */
.run([   
  '$rootScope',
  '$state',
  '$window',
  'HistoryService',
  'BrowserDetectionService',
  'MarkersService',
  'RegionsService',
  'SortService',
  'AppConfig',
  function(
    $rootScope,
    $state,
    $window,
    HistoryService,
    BrowserDetectionService,
    MarkersService,
    RegionsService,
    SortService,
    AppConfig
  ) 
  {
    // global handle for debugging
    if (window.appDebug === undefined) {window.appDebug = {};}
    angular.extend(window.appDebug, {
      $rootScope              : $rootScope,
      $state                  : $state,
      AppConfig               : AppConfig,
      HistoryService          : HistoryService,
      BrowserDetectionService : BrowserDetectionService,
      SortService             : SortService,
      RegionsService          : RegionsService
    });

    /**
     * Navigation History 
     */
    $rootScope.HistoryService = HistoryService;
    $rootScope.ignoreStates = [
      
    ];
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (fromState.name === "") { // The initial transition comes from "root", which uses the empty string as a name.
          // console.log("initial state: " + toState.name);
        }
      if ($rootScope.ignoreStates.indexOf(toState.name) === -1
          && !HistoryService.isTransitioningState
      ) { 
        HistoryService.add(toState); 
      }
      window.appDebug.currentState = {
        state: toState,
        params: toParams
      };
      window.appDebug.previousState = {
        state: fromState,
        params: fromParams
      };
      
      // after state change, scroll to the top of the page
      $window.scrollTo(0, 0);
    });
  
    // at the beginning of any state change, close any open marker infowindows
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
	    MarkersService.closeAllInfoWindows();
	  });
	  
  
    /**
     * BrowserDetection
     */
    $rootScope.browserDetection = BrowserDetectionService;  
    
    /**
     * Body Clicked
     */
    $rootScope.bodyClicked = function(event)
    {
      // console.log('body clicked');
      if ( angular.element(event.target).hasClass('not-body-click') ) {return;}
      if ( angular.element(event.target).parents().hasClass('not-body-click') ) {return;}
      $rootScope.$broadcast('body::clicked', {event: event});
    };
    
    

  } // end function
]) // end Rootscope Init

/**
 * @brief Services Initialization
 */
.run([  
  '$rootScope',
  '$animate',
  '$q',
  'ngWrap',
  'OmnitureService',
  'CommunitiesService',
  'MarkersService',
  'AuthService',
  'FavoritesService',
  'FilterService',
  'RegionsService',
  'EmailService',
  'NgMap',
  'usSpinnerService',
  'AppConfig',
  function(
    $rootScope,
    $animate,
    $q,
    ngWrap,
    OmnitureService,
    CommunitiesService,
    MarkersService,
    AuthService,
    FavoritesService,
    FilterService,
    RegionsService,
    EmailService,
    NgMap,
    usSpinnerService,
    AppConfig
  ) 
  {
    
    // debug 
    angular.extend(window.appDebug, {
      OmnitureService     : OmnitureService,
      CommunitiesService  : CommunitiesService,
      MarkersService      : MarkersService,
      NgMap               : NgMap,
      AuthService         : AuthService,
      FavoritesService    : FavoritesService,
      FilterService       : FilterService,
      EmailService        : EmailService,
      SpinnerService      : usSpinnerService,
    });
    
    $rootScope.AuthServiceGuest         = AuthService.guest;
    
    // removing controller-specific stateful services from appDebug (can still access via the controller/scope binding)
    // window.appDebug.SiteHeaderService   = SiteHeaderService;

    // ng-animate
    $animate.enabled(true);
    //console.log( 'animate enabled?: ', $animate.enabled() )
  
    // Omniture Service
    OmnitureService.config(AppConfig.omniture);
    // Markers Service
    MarkersService.config(AppConfig.MarkersService);
  
  
    // Communities Service
    CommunitiesService.config(AppConfig.CommunitiesService);
    
    // guest auth service
    AuthService.guest.config(AppConfig.AuthService.guest);
    
    // favorites service
    FavoritesService.config(AppConfig.FavoritesService);
    
    // email service
    EmailService.config(AppConfig.EmailService);
    
    // Regions Service
    RegionsService.config(AppConfig.regions);
    RegionsService.getRegions();
    
    // initial data load
    $rootScope.initialDataLoadDeffered = $q.defer();
    $rootScope.initialDataLoad = $rootScope.initialDataLoadDeffered.promise;
    
    // load communities (uses singleton pattern for ajax promise, only single xhr request is made);
    CommunitiesService.getCommunities();
    
    $rootScope.$watch('AuthServiceGuest.settings.whoami', function(newValue, oldValue) {
      // console.log('AuthService.guest.settings.whoami changed, oldValue: ', oldValue, ' newValue: ', newValue);
      if (newValue === oldValue) {return}
      if (newValue !== null) {
        // populate favorites 
        CommunitiesService.getCommunities().then(function() {
          FavoritesService.set(newValue.favorite_communities);
          $rootScope.$broadcast('AuthService::loggedIn');
        });
      } else {
        // clear favorites
        // console.log('clearing favorites');
        CommunitiesService.getCommunities().then(function() {
          FavoritesService.set([]);
        });
        $rootScope.$broadcast('AuthService::loggedOut');
      }
    });
    
    AuthService.guest.whoami().then(function(response) {
      $rootScope.initialDataLoadDeffered.resolve();
    });
    
    $rootScope.CommunitiesService = CommunitiesService;
    
    $rootScope.$watch('CommunitiesService.settings.cache.communities', function(newValue, oldValue) {
        MarkersService._buildMarkers();
    });
    
    // globals wrapped for injection (ngWrap, caution - removes from the global scope as well)
    // ...
  
  
    
  } // end function
]) // end run Services Initialization


/**
 * Prefetch html templates
 */
.run([  
  '$rootScope',
  '$timeout',
  '$templateCache',
  '$http',
  'AppConfig',
  function(
    $rootScope,
    $timeout,
    $templateCache,
    $http,
    AppConfig
  ) 
  {
  
    window.appDebug.$templateCache = $templateCache;
    
    // after the first page load / state change
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

      // preload templates for other states and directives that may not yet be loaded
      /*
      $timeout(function() {
        for (var key in AppConfig.prefetch.templates) {
          var template = AppConfig.prefetch.templates[key];
          $http.get(template, { cache: $templateCache });
        }  
      }, AppConfig.prefetch.delay);
      */
    });
    
  }
]) // end run block for prefetching html templates




; // end module