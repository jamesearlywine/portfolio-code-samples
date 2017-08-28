/* globals angular */

/**
 * dependencies injected
 */
angular.module('app.community', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('community', {
      url: '/community',
      templateUrl: '../preview/app/community/community.html',
      controller: ['$state', function($state) {
        $state.go('communities', {}, {});
      }],
      resolve: {
        
      },
      reload: true
    })
    .state('communityById', {
      url: '/community/:id',
      templateUrl: '../preview/app/community/community.html',
      controller: 'CommunityCtrl',
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
.controller('CommunityCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'OmnitureService',
    'CommunitiesService',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    OmnitureService,
    CommunitiesService
) {
  
    /* debug */
    window.appDebug.CommunityCtrl   = $scope;
    
    /**
     * Scope initialization
     */
    $scope.communityId              = $state.params.id;
    if ($scope.communityId === undefined) {return false;}
    
    /* community controller entry */
    $scope.firstLoad = true;
    $scope.main = function() {
      
      /**
       * Data
       */
      CommunitiesService.getCommunityById($scope.communityId)
        .then(function(community) {
          $scope.community = community;
          $scope.mapCommunities = [community];
          if ($scope.firstLoad) {
            $scope.communityGalleryImages = $scope.community.gallery.images !== null
                                          ? $scope.community.gallery.images.slice(0)
                                          : []
            ;
            $scope.firstLoad = false;
          }
        })
      ;
      
    };
    
    /**
     * Google Maps
     */
    // keep track of whether google maps has loaded into the global space
    $scope.googleMapsLoaded = false;
    window.getGlobalGoogleMaps.then(function() {
      $timeout(function() {
        this.googleMapsLoaded = true;  
      }.bind(this), 0);
    }.bind($scope));        
    
    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-community'
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