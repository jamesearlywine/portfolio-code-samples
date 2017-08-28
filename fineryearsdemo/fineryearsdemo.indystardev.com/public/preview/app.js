/* global angular, env, $ */

/**
 * @brief App Dependencies Injected
 */
window.app = angular.module('app', [
  // vendor items
  'ui.router',

  // services
  'BrowserDetectionService',

  // directives
  'BusyAnimationDirective',

  // routables
  'app.home',

])

/**
 * @brief AppConfig
 */
.constant('AppConfig', {
    "testKey" : window.env.testKey
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
  'AppConfig',
  function(
    $rootScope,
    $state,
    $window,
    BrowserDetectionService,
    AppConfig
  ) 
  {
    // global handle for debugging
    window.appDebug  = {
      $rootScope              : $rootScope,
      $state                  : $state,
      AppConfig               : AppConfig,
      BrowserDetectionService : BrowserDetectionService,
    };

    /**
     * BrowserDetection
     */
    $rootScope.BrowserDetectionService = BrowserDetectionService;  
    

  } // end function
]) // end Rootscope Init



; // end module