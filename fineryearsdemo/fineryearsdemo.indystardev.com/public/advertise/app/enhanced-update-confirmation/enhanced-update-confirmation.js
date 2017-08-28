/* globals angular */
window.scriptBasepath.detectFor('RoutableAdvertiseEnhancedUpdateConfirmation');

/**
 * dependencies injected
 */
angular.module('app.enhanced-update-confirmation', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('enhanced-update-confirmation', {
      url: '/enhanced-update-confirmation',
      templateUrl: window.scriptBasepath.for('RoutableAdvertiseEnhancedUpdateConfirmation') + 'enhanced-update-confirmation.html', // relative to document root
      controller: 'EnhancedUpdateConfirmationCtrl',
      reload: true
    })
  ; // end $stateProvider.state()
  
}])

/**
 * Controller
 */
// controllers definition 
.controller('EnhancedUpdateConfirmationCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'OmnitureService',
    'AdvertiseService',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    OmnitureService,
    AdvertiseService
    ) {
  
    /* debug */
    window.appDebug.EnhancedUpdateConfirmationCtrl         = $scope;

    /**
     * Scope Initialization
     */
    $scope.AdvertiseService     = AdvertiseService;
    
    /**
     * Redirection
     */
    if ( AdvertiseService.enhanced.get('lastResponse') === null ) {
      $state.go('signup', {}, {});
    };


    /* signup controller entry */
    $scope.main = function() {
      

    };
   

    
    /* kick it off */
    $scope.main();
      
  } // end function
]) // end controller

;