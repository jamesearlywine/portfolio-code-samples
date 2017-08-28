/* globals angular, $ */

/**
 * dependencies injected
 */
angular.module('app.saved', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('saved', {
      url: '/saved',
      templateUrl: 'app/saved/saved.html',
      controller: 'SavedCtrl',
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
.controller('SavedCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'CommunitiesService',
    'BusyAnimationService',
    'MarkersService',
    'AuthService',
    'FavoritesService',
    'OmnitureService',
    'FilterService',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    CommunitiesService,
    BusyAnimationService,
    MarkersService,
    AuthService,
    FavoritesService,
    OmnitureService,
    FilterService
) {
  
    /* debug */
    window.appDebug.SavedCtrl         = $scope;

    $scope.ctrlName='saved';
    
    /**
     * Redirection
     */
    // guest authentication
		$scope.AuthServiceGuest = AuthService.guest.get();
		if (!$scope.AuthServiceGuest.isLoggedIn) {
		  AuthService.guest.whoami().then(function() {
		    if (!$scope.AuthServiceGuest.isLoggedIn) {
		      AuthService.guest.promptLogin()
            .then(
              function(result) {
                if (!AuthService.isLoggedIn) {
                  $state.go('home', {}, {});
                }
                console.log('Modal closed with result: ', result);
              },
              function() {
                if (!AuthService.isLoggedIn) {
                  $state.go('home', {}, {});
                }
                console.log('Modal dismissed at: ' + new Date());
              }
            )
          ;
		    }
		  });
			
		}
		
		/**
		 * Loading Animation
		 */
		$scope.loadingAnimationDelay = 500; // ms
		$scope.loadingAnimationPromise = $timeout(function() {
		  $scope.startLoadingAnimation();
		}, $scope.loadingAnimationDelay);
		$scope.startLoadingAnimation = function() {
		  BusyAnimationService.start();
		};
		$scope.stopLoadingAnimation = function() {
		  $timeout.cancel($scope.loadingAnimationPromise);
		  BusyAnimationService.stop();
		};
		

    /* saved controller entry */
    $scope.main = function() {
      
    };
    
    /**
     * Data & Markers
     */
    $scope.dataReady = false;
    $scope.loadData = function() {
      $scope.dataReady = false;
      return CommunitiesService.getCommunities()
        .then(
          function(communities) {
            $scope.communities = FavoritesService._favoriteCommunities;
            FavoritesService.syncCommunitiesFavorites()
              .then(function() {
                $scope.setMarkers(1000);
              })
            ;
            $timeout(function() {
              $scope.dataReady = true;
              $scope.stopLoadingAnimation();
            }, 20);
          }
        )
      ;  
    };
    $scope.loadData();
    
    $scope.setFilterRankings = function() {
      // spoof filter rankings
      for (var key in $scope.communities) {
        $scope.communities[key].filterRanking = parseInt(key, 10) + 1;
      }
    };
    $scope.$watch('communities',    function() {$scope.setMarkers(300);});
    $scope.$watch('communities[0]', function() {$scope.setMarkers(300);});
      
    $scope.setMarkers = function(delay)
    {
      if (delay === undefined) {delay = 1000;}
      $timeout(function() {
        $scope.setFilterRankings();
        MarkersService.setMarkers($scope.communities);
      }, delay);
    };
    
    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-saved'
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


    /**
     * @brief Tabs
     * @note  valid tab values are ['table', 'map', 'filter']
     */
    $scope.tabDefault = 'table';
    $scope.tabGoto = function(tabName)
    {
      if (tabName === undefined) { tabName = $scope.tabDefault; }
      return $timeout(function() {
        // console.log('updating tab');
        $scope.tab = tabName.toLowerCase().trim();
        $scope.$root.$broadcast('map-tab-changed', {toTab: $scope.tab, mapType: $scope.mapType});
        if ($scope.communities && $scope.communities[0] && $scope.communities[0].filterRanking === undefined) {
          $scope.setMarkers();
        }
      }, 0);  
    };
    $scope.tabGoto($scope.tabDefault);
	  
	 
	  /**
	   * Resize / Responsive map
	   */
	  $scope.mapType = null;
    $scope.mobileBreakpoint = 721;
    $scope.detectMapType = function()
    {
      $scope.mapWidth = $('#saved-map-container').width();
      $scope.previousMapType = $scope.mapType;
      $scope.mapType  = $scope.mapWidth > $scope.mobileBreakpoint
                      ? 'desktop'
                      : 'mobile'
      ;
      if ($scope.mapType !== $scope.previousMapType) {
        if ($scope.$root !== null) {
          $scope.$root.$broadcast('map-type-changed', {mapType: $scope.mapType});
        }
      }
      
      // console.log('mapWidth: ', $scope.mapWidth, ' mapType: ', $scope.mapType, ' previousMapType: ', $scope.previousMapType);
    };
    $timeout(function() {
      $scope.detectMapType();  
    }, 500)
    angular.element($window).bind('resize', function() {
      $timeout(function() {
        $scope.detectMapType();  
      }, 0);
    });
	  
	  /**
	   * Community Region clicked
	   */
	  $scope.openCommunity = null;
	  $scope.$on('tableListCommunity::communityRegionClicked', function(event, args) {
	    // console.log('SavedCtrl heard tableListCommunity::communityRegionClicked event: ', event, ' args: ', args);
	    $timeout(
	      function() {
    	    $scope.openCommunity = args.community;
    	    $scope.tabGoto('map');
  	    }, 
  	    0
	    ).then(
	      function() {
  	      $scope.$root.$broadcast('community-map:refresh', {openCommunity: $scope.openCommunity.id});  
  	    }
	    );
	    
	    
	  });
	   
	  
	  
    
    /* kick it off */
    $scope.main();
      
  } // end function
]) // end controller

;