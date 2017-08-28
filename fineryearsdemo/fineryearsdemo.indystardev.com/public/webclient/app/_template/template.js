/* globals angular */

/**
 * dependencies injected
 */
angular.module('app.template', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('template', {
      url: '/template',
      templateUrl: 'app/template/template.html',
      controller: 'TemplateCtrl',
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
.controller('TemplateCtrl', [
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
    window.appDebug.templateCtrl         = $scope;

    
    /* template controller entry */
    $scope.main = function() {


    };
    


    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-template'
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