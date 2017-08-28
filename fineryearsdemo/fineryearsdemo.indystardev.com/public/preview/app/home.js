/* globals angular */

/**
 * dependencies injected
 */
angular.module('app.home', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '../preview/app/home.html',
      controller: 'HomeCtrl',
      resolve: {
        
      },
      reload: true
    })
  ; // end $stateProvider.state()
  
}])

/**
 * Controller
 */
// controllers definition 
.controller('HomeCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'OmnitureService',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    OmnitureService
) {
  
    

    window.location.href="../#/";
    
    
		
		
      
  } // end function
]) // end controller

;