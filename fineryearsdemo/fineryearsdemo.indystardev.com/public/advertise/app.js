/* global angular, env, $ */

/**
 * @brief App Dependencies Injected
 */
window.app = angular.module('app', [
  // vendor items
  'ui.bootstrap',
  'ui.router',
  // 'ct.ui.router.extras',
  'ng-wrap',
  'ngSanitize',
  'ngFileUpload',
  'ngMessages',
  'ngAnimate',
  
  // services
  'OmnitureService',
  'AdvertiseService',
  'BrowserDetectionService',
  'RegionsService',
  'CommunityCategoriesService',
  'SortService',
  'CommunitiesService',
  'AmenitiesService',
  'FavoritesService',
  'FilterService',
  
  // directives
  'BusyAnimationDirective',
  'myEnter',

  // routables
  'app.signup',
  'app.enhanced',
  'app.confirmation',
  'app.enhanced-update-confirmation',
  
  // filters
  'filter.reverse'
  
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
   * Webservice Endpoints
   */
  webserviceApiKey: window.env.webserviceApiKey,
  
  /**
   * Regions Service
   */
  regions: {
    endpoints: {
      'getRegions'  : '../webservice/index.php/region'
    }
  },
  
  /**
   * Amenities Service
   */
  amenities: {
    endpoints: { // use live endpoints for now (should use cached)
      'getAmenities'  : '../webservice/index.php/amenity'
    }
  },
  
  /**
   * Community Categories Service
   */
  communityCategories: {
    endpoints: {
      'getCommunityCategories': '../webservice/index.php/communityCategory'
    }
  },
  
  AdvertiseService: {
    signup: {
      endpoints: {
        'submitCommunity': '../webservice/index.php/communitySubmission'
      }
    },
    enhanced: {
      endpoints: {
        'updateCommunity': '../webservice/index.php/communityEnhancedUpdateSubmission'
      }
    },
    
  },
  
  CommunitiesService: {
    endpoints: {
      'getCommunityByEnhancedUpdateApiKey': '../webservice/index.php/communityByEnhancedUpdateApiKey'
    }
  }
  
  
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
    $rootScopeProvider.digestTtl(45);
  

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
      return '/signup';   
    });
    
  }
]) // end Routing Config
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
 * @brief Rootscope Init
 */
.run([   
  '$rootScope',
  '$state',
  '$window',
  'BrowserDetectionService',
  'BusyAnimationService',
  'AdvertiseService',
  'OmnitureService',
  'RegionsService',
  'AmenitiesService',
  'CommunityCategoriesService',
  'CommunitiesService',
  'AppConfig',
  function(
    $rootScope,
    $state,
    $window,
    BrowserDetectionService,
    BusyAnimationService,
    AdvertiseService,
    OmnitureService,
    RegionsService,
    AmenitiesService,
    CommunityCategoriesService,
    CommunitiesService,
    AppConfig
  ) 
  {
    // global handle for debugging
    window.appDebug  = {
      $rootScope                  : $rootScope,
      $state                      : $state,
      AppConfig                   : AppConfig,
      AdvertiseService            : AdvertiseService,
      BrowserDetectionService     : BrowserDetectionService,
      BusyAnimationService        : BusyAnimationService,
      OmnitureService             : OmnitureService,
      RegionsService              : RegionsService,
      AmenitiesService            : AmenitiesService,
      CommunityCategoriesService  : CommunityCategoriesService,
      CommunitiesService          : CommunitiesService
    };

    /**
     * BrowserDetection
     */
    $rootScope.browserDetection = BrowserDetectionService;  
    
    // Omniture Service
    OmnitureService.config(AppConfig.omniture);
    
    // Regions Service
    RegionsService.config(AppConfig.regions);
    //RegionsService.getRegions();
    
    // Amenities Service
    AmenitiesService.config(AppConfig.amenities);
    
    
    // CommunityCategories Service
    CommunityCategoriesService.config(AppConfig.communityCategories);
    //CommunityCategoriesService.getCommunityCategories();
    
    // Communities Service
    CommunitiesService.config(AppConfig.CommunitiesService);
    
    //AdvertiseService
    AdvertiseService.signup.config(AppConfig.AdvertiseService.signup);
    AdvertiseService.enhanced.config(AppConfig.AdvertiseService.enhanced);

  } // end function
]) // end Rootscope Init


; // end module