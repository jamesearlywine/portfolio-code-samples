/* globals angular */

/**
 * dependencies injected
 */
angular.module('app.about', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('about', {
      url: '/about',
      templateUrl: 'app/about/about.html',
      controller: 'AboutCtrl',
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
.controller('AboutCtrl', [
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
  
    /* debug */
    window.appDebug.AboutCtrl         = $scope;

    
    /* about controller entry */
    $scope.main = function() {


    };
    


    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-about'
    };
    $scope.omnitureDelay = 1000; // ms
    $scope.reportToOmniture = function() {
        // console.log('reporting to omniture: ', $scope.omniture);
        $timeout(function() {
            OmnitureService
                .set('section',     $scope.omniture.section)
                .set('extension',   $scope.omniture.extension)
                .report()
            ;                    
        }, $scope.omnitureDelay);
    };

    

    
    /* kick it off */
    $scope.main();
      
  } // end function
]) // end controller

;