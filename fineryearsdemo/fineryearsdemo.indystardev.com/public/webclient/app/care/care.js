/* globals angular */

/**
 * dependencies injected
 */
angular.module('app.care', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('care', {
      url: '/care',
      templateUrl: 'app/care/care.html',
      controller: 'CareCtrl',
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
.controller('CareCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'OmnitureService',
    'SiteHeaderService',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    OmnitureService,
    SiteHeaderService
) {
  
    /* debug */
    window.appDebug.CareCtrl        = $scope;

    $scope.SiteHeaderService        = SiteHeaderService;
    
    /* care controller entry */
    $scope.main = function() {


    };
    


    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-care'
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