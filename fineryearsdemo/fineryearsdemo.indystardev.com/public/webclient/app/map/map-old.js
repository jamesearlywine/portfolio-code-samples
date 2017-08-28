/* globals angular, $ */

/**
 * dependencies injected
 */
angular.module('app.map', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('map', {
      url: '/map?id',
      templateUrl: 'app/map/map.html',
      controller: 'MapCtrl',
      resolve: {
        'citiesAndZips' : ['CommunitiesService', function(CommunitiesService) {
          return CommunitiesService.getCitiesAndZips();
        }]
      },
      reload: true
    })
  ; // end $stateProvider.state()
  
}])

/**
 * Controller
 */
// controllers definition 
.controller('MapCtrl', [
    '$window',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'AppConfig',
    'CommunitiesService',
    'FilterService',
    'BusyAnimationService',
    'OmnitureService',
    'MarkersService',
    'HistoryService',
    'citiesAndZips',
  function(   
    $window,
    $scope,
    $state,
    $stateParams,
    $timeout,
    AppConfig,
    CommunitiesService,
    FilterService,
    BusyAnimationService,
    OmnitureService,
    MarkersService,
    HistoryService,
    citiesAndZips
) {
  
    /* debug */
    window.appDebug.MapCtrl   = $scope;
    $scope.$stateParams       = $stateParams;

    /* map controller entry */
    $scope.main = function() {
      $scope.loadData();
    };
    $scope.ctrlName='map';


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
		
    /**
     * Data 
     */
    $scope.dataReady = false;
    $scope.loadData = function() 
    {
      CommunitiesService.getCommunities().then(function(communities) {
        $scope.communities = communities;
        $timeout(function() {
          $scope.filterData();
          $scope.dataReady = true;
          $scope.stopLoadingAnimation();  
        });
      });
    };

    
    /**
     * Filtering
     */
    $scope.clickables = {
      careTypes: [],
      regions: []
    };
    $scope.FilterService = FilterService;
    $scope.filterSettingsChanged = false;
    $scope.filteredCommunities = [];
    $scope.filterData = function(newValues, oldValues, scope)
    {
      $timeout(function() {
        var filtered = FilterService.filter_communities($scope.communities);
        $scope.filteredCommunities.splice(0);
        $scope.filteredCommunities.push.apply($scope.filteredCommunities,  filtered);
        $scope.clickables = FilterService.getClickables();
        $scope.$root.$broadcast('MapCtrl::filterRefreshed');
      });
    };
    $scope.$watchGroup(
      [
        "FilterService.settings.communities.cityOrZip",
        "communities",
        "filteredCommunities",
      ]
      , 
      function() {
        // console.log('filterSettingsChanged');
        $scope.filterSettingsChanged = true;
        FilterService.settings.communities.filterIsCustom = true;
      }
    );
    
    $scope.$watchGroup(
      [
        "FilterService.settings.communities.regions['all']",
        "FilterService.settings.communities.regions[1]",
        "FilterService.settings.communities.regions[2]",
        "FilterService.settings.communities.regions[3]",
        "FilterService.settings.communities.regions[4]",
        "FilterService.settings.communities.regions[5]",
        "FilterService.settings.communities.category_memberships['all']",
        "FilterService.settings.communities.category_memberships[1]",
        "FilterService.settings.communities.category_memberships[2]",
        "FilterService.settings.communities.category_memberships[3]",
        "FilterService.settings.communities.category_memberships[4]",
        "FilterService.settings.communities.category_memberships[5]",
        "FilterService.settings.communities.category_memberships[6]",
        "FilterService.settings.communities.category_memberships[7]",
        "FilterService.settings.communities.category_memberships[8]",
        "FilterService.settings.communities.category_memberships[9]",
        "FilterService.settings.communities.category_memberships[10]",  ]
      , 
      function() {
        // console.log('filterSettingsChanged');
        $scope.filterSettingsChanged = true;
        $scope.filterData();
      }
    );
    $scope.filterUpdate = function()
    {
      $timeout(function() {
        $scope.filterData();
        $scope.mapTabGoto('results');
        $scope.mapTabMobileGoto('map')
      }, 0);
    };
    $scope.setFilterToSingleRegion = function(region)
    {
      // console.log('setting filter region to region: ', region);
      for (var key in FilterService.settings.communities.regions) {
        FilterService.settings.communities.regions[key] = ( region.id.toString() === key.toString() )
      }
      $scope.FilterService.initCategories();
      $scope.filterData();
    };    
    $scope.setFilterToSingleCareType = function(careType)
    {
      console.log('setting filter careType to careType: ', careType);
      for (var key in FilterService.settings.communities.category_memberships) {
        FilterService.settings.communities.category_memberships[key] = ( careType.id.toString() === key.toString() )
      }  
      $scope.FilterService.initRegions();
      $scope.filterData();
    };
    $scope.setFilterCityOrZip = function(cityOrZip)
    {
      // console.log('setting filter cityOrZip: ', cityOrZip);
      // not doing anything, default behavior is already the expected behavior.. --jle
    };

    /**
     * cityOrZip 
     */
    $scope.citiesAndZips = citiesAndZips.cities.concat(citiesAndZips.zips);
    $scope.initPreviousSettings = function() 
    {
      $scope.previousFilterRegionsSettings = {
            'all' : true,   // all regions
                1 : false,  // North
                2 : false,  // South
                3 : false,  // East
                4 : false,  // West
                5 : false,  // Inner I-65
        }
      ;
    };
    $scope.initPreviousSettings();
    if (Object.keys(FilterService.settings.communities.regions).length < 1) {
      $timeout(function() {
        FilterService.initRegions();
      }, 0);
    }
    $scope.regionsDisabled = false;
    $scope.updateRegionsSettings = function(newValue, oldValue) {
      if (newValue === undefined || newValue === null) { newValue = ''; }
      if (oldValue === undefined || oldValue === null) { oldValue = ''; }
      if (newValue.trim() === oldValue.trim()) {
        // console.log('not a real change in value, ignoring');
        return;
      }
      // console.log('cityOrZip newValue: ', newValue);
      var selection = FilterService.settings.communities.cityOrZip;
      if (newValue.trim() !== '') {
        // console.log('logging regionsSettings FilterService.settings.communities.regions: ', FilterService.settings.communities.regions);
        $scope.previousFilterRegionsSettings = angular.extend({}, FilterService.settings.communities.regions);
        FilterService.clearCommunitiesRegionsSettings();
        $scope.regionsDisabled = true;
      } else {
        if ($scope.previousFilterRegionsSettings !== null) {
          // console.log('restoring regionsSettings to  $scope.previousFilterRegionsSettings: ', $scope.previousFilterRegionsSettings);
          FilterService.settings.communities.regions = angular.copy($scope.previousFilterRegionsSettings);
        }
        $scope.regionsDisabled = false;
      }
      $scope.filterData();
    };
    $scope.$watch('FilterService.settings.communities.cityOrZip', $scope.updateRegionsSettings);
    $scope.initRegions = function() 
    {
      if (typeof FilterService.settings.communities.cityOrZip === 'string'
          &&     FilterService.settings.communities.cityOrZip.trim() !== ''
      ) {
        $scope.previousFilterRegionsSettings = angular.extend({}, FilterService.settings.communities.regions);
        FilterService.clearCommunitiesRegionsSettings();
        $scope.regionsDisabled = true;
      }
    };
    $scope.initRegions();
      
    // [home] -> [communties] -> [mapview] .. not initializing with correct regions and previous settings (?)
      
    $scope.cityOrZipIsOpen = null;
    $scope.initCityOrZipDropDown = function() { 
      if (FilterService.settings.communities.cityOrZip === null) {
        FilterService.settings.communities.cityOrZip = ''; 
      }
    };
    



    /**
     * Google Maps
     */
    // keep track of whether google maps has loaded into the global space
    $scope.googleMapsLoaded = false;
    window.getGlobalGoogleMaps.then(function() {
      $timeout(function() {
        this.googleMapsLoaded = true;
        $scope.openCommunity = $state.params.id;
      }.bind(this), 0);
    }.bind($scope));


    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-map'
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
     * Table View
     */
    $scope.goToTableView = function() 
    {
      
      var previousState = HistoryService.getPreviousByName(['communities', 'communitiesByType']);
      var params = null;
      
      if  (   $scope.hasVisitedSearch
           && $scope.filterSettingsChanged
      ) 
      {
        FilterService.settings.communities.isCustomFilter = true;
      }
      if (previousState !== null) { 
        params = previousState.params;
      } else {
        previousState = 'communities';
        params = {};
      }
      if (FilterService.settings.communities.isCustomFilter) 
      {
        // console.log('filterSettingsChanged, routing accordingly..');
        $state
          .go('communitiesByType', 
            {communityType: 'search'}, 
            {}
          )
        ;
      } else {
        $state
          .go(previousState,
              params,
              {}
          )
        ;  
      }

    };
    $scope.emptyCityOrZipIfNotValid = function()
    {
      FilterService.settings.communities.cityOrZip = 
        (FilterService.settings.communities.cityOrZip === undefined)
          ? null
          : FilterService.settings.communities.cityOrZip
      ;
    }
    
    /**
     * @brief Map Tabs
     * @note  valid tab values are ['results', 'search']
     */
    $scope.mapTabDefault = 'results';
    $scope.mapTabGoto = function(tabName, updateOtherTabs)
    {
      if (updateOtherTabs === undefined) { updateOtherTabs = true;}
      if (tabName === undefined) { tabName = $scope.mapTabDefault; }
      if (updateOtherTabs) {
        if (tabName === 'search') { 
          $scope.hasVisitedSearch = true;
          $scope.filterSettingsChanged = false;
          $scope.mapTabMobileGoto('search', false); 
        } 
        if (tabName === 'results') { 
          $scope.mapTabMobileGoto('map', false); 
        } 
      }
      $timeout(function() {
        $scope.mapTab = tabName.toLowerCase().trim();
        $scope.$root.$broadcast('map-tab-changed', {toTab: $scope.mapTabMobile, mapType: $scope.mapType});
      }, 0);  
    };
    $scope.mapTabGoto($scope.mapTabDefualt, false);
    
    $scope.mapTabMobileDefault = 'map';
    $scope.hasVisitedSearch = false;
    $scope.mapTabMobileGoto = function(tabName, updateOtherTabs) 
    {
      if (updateOtherTabs === undefined) { updateOtherTabs = true;}
      if (tabName === undefined) { tabName = $scope.mapTabMobileDefault; }
      if (updateOtherTabs) {
        if (tabName === 'map') { 
          $scope.mapTabGoto('results', false); 
        }
        if (tabName === 'results') { 
          $scope.mapTabGoto('results', false); 
        }
        if (tabName === 'search') {
          $scope.hasVisitedSearch = true;
          $scope.filterSettingsChanged = false;
          $scope.mapTabGoto('search', false); 
        }  
      }
      $timeout(function() {
        $scope.mapTabMobile = tabName.toLowerCase().trim();
        $scope.$root.$broadcast('map-tab-changed', {toTab: $scope.mapTabMobile, mapType: $scope.mapType});
        //if ($scope.filterSettingsChanged) {$scope.filterData();}
      }, 0);
    };
    $scope.mapTabMobileGoto($scope.mapTabMobileDefault, false);
    
    $scope.mapType = null;
    $scope.mobileBreakpoint = 720;
    $scope.detectMapType = function(delay)
    {
      if (delay === undefined) {delay = 0;}
      $timeout(function() {
        $scope.mapWidth = $('#map-map-container').width();
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
        // console.log('mapWidth: ', $scope.mapWidth, ' mapType: ', $scope.mapType);  
      }, delay);
    };
    $scope.detectMapType();  
    $scope.detectMapType(300);
    
    
    /**
     * Event bindings
     */
    angular.element($window).bind('resize', $scope.detectMapType);
    $scope.$on('$destroy', function() {
      angular.element($window).unbind('resize', $scope.detectMapType);
    });
    
    /* kick it off */
    $scope.main();
      
  } // end function
]) // end controller

;