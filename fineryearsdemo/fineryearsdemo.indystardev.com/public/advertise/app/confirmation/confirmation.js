/* globals angular */
window.scriptBasepath.detectFor('RoutableAdvertiseConfirmation');

/**
 * dependencies injected
 */
angular.module('app.confirmation', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('confirmation', {
      url: '/confirmation',
      templateUrl: window.scriptBasepath.for('RoutableAdvertiseConfirmation') + 'confirmation.html', // relative to document root
      controller: 'ConfirmationCtrl',
      reload: true
    })
  ; // end $stateProvider.state()
  
}])

/**
 * Controller
 */
// controllers definition 
.controller('ConfirmationCtrl', [
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
    window.appDebug.ConfirmationCtrl         = $scope;

    /**
     * Scope Initialization
     */
    $scope.AdvertiseService     = AdvertiseService;
    
    /**
     * Redirection
     */
    if ( AdvertiseService.signup.get('lastResponse') === null ) {
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