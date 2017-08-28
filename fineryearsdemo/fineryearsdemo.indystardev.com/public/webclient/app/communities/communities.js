/* globals angular */

/**
 * dependencies injected
 */
angular.module('app.communities', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('communities', {
      url: '/communities',
      templateUrl: 'app/communities/communities.html',
      controller: 'CommunitiesCtrl',
      sticky: false,
      resolve: {
        'citiesAndZips' : ['CommunitiesService', function(CommunitiesService) {
          return CommunitiesService.getCitiesAndZips();
        }]
      },
      reload: true
    })
  ; // end $stateProvider.state()
  $stateProvider
    .state('communitiesByType', {
      url: '/communities/:communityType',
      templateUrl: 'app/communities/communities.html',
      controller: 'CommunitiesCtrl',
      sticky: false,
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
.controller('CommunitiesCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    '$q',
    'lodash',
    'AppConfig',
    'BrowserDetectionService',
    'BusyAnimationService',
    'CommunitiesService',
    'OmnitureService',
    'HistoryService',
    'FilterService',
    'citiesAndZips',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    $q,
    _,
    AppConfig,
    BrowserDetectionService,
    BusyAnimationService,
    CommunitiesService,
    OmnitureService,
    HistoryService,
    FilterService,
    citiesAndZips
) {
  
    /* debug */
    window.appDebug.CommunitiesCtrl         = $scope;
    $scope.stateParams = $state.params;
    
    
    /**
     * Scope Initialization
     */
    // community type
    $scope.communityType = $state.params.communityType;
    
    
    /**
     * Controller entry
     */
    $scope.main = function() {
      $scope.loadData();
      $scope.detectDynamicTitle();
      $scope.initAccordion();
      $scope.reportToOmniture();
    };

		/**
		 * Loading Animation
		 */
		$scope.startLoadingAnimation = function() {
      // console.log('starting loading animation');
      BusyAnimationService.start();
    };
		$scope.stopLoadingAnimation = function(imperative) {
		  if (imperative === undefined) {imperative = false;}
		  if (imperative || 
		      (
    		      $scope.isCommunitiesNgRepeatFinished
    		   && $scope.dataReady 
    		  )
		  ) {
		    // console.log('stopping loading animation');
		    $timeout.cancel($scope.loadingAnimationPromise);
		    BusyAnimationService.stop();
		  }
		};
		$scope.loadingAnimationDelay = BrowserDetectionService.isMobile ? 0 : 500; // ms
		if ($scope.loadingAnimationDelay === 0) {
		  $scope.loadingAnimationPromise = $q.defer().promise;
		  BusyAnimationService.start(0);
		} else {
  		$scope.loadingAnimationPromise = $timeout(function() {
  		  $scope.startLoadingAnimation();
  		}, $scope.loadingAnimationDelay);  
		}
		$scope.isCommunitiesNgRepeatFinished = false;
    $scope.communitiesNgRepeatFinished = function()
    {
      $scope.isCommunitiesNgRepeatFinished = true;
      $scope.stopLoadingAnimation();
    };
    $scope.$on('communities-ng-repeat-finished', function(event, args) {
      $scope.communitiesNgRepeatFinished();
    });
    


    /**
     * Data 
     */
    $scope.dataReady = false;
    $scope.loadData = function() {
       CommunitiesService.getCommunities().then(function(communities) {
        $scope.communities = communities;
        $scope.filterData();
        $scope.dataReady = true;
        if ($scope.communityType) {
          $timeout(function() {
            $scope.setFilterByCommunityType();
          });
        } else {
          $timeout(function() {
            // console.log('CommunitiesCtrl not initializing filter service, communityType: ', $scope.communityType);
            // FilterService.init();
          }, 0);
        }
        $scope.stopLoadingAnimation();
      });
    };

    
    /**
     * Dynamic Title
     */
    $scope.dynamicTitlesByCommunityType = {
      'maintenanceFree'     : 'Limited Maintenance / Maintenance Free',
      'independentLiving'   : 'Independent Living',
      'ccrc'                : 'Continuing Care Retirement Communities',
      'assistedLiving'      : 'Assisted Living',
      'homeCare'            : 'Home Care',
      'onSiteHomeCare'      : 'On-Site Home Care',
      'respiteCare'         : 'Respite Care',
      'memoryCare'          : 'Memory Care',
      'rehab'               : 'Rehabilitation Care',
      'nursingCare'         : 'Nursing / Specialty Care',
      'search'              : 'Search Results'
    };
    
    $scope.dynamicTitleDefault = 'All Communities';
    $scope.detectDynamicTitle = function(updateScope)
    {
      if (updateScope === undefined) {updateScope = true;}
      var dynamicTitleByCommunityType = $scope.dynamicTitlesByCommunityType[$scope.communityType];
      var dynamicTitle  = (dynamicTitleByCommunityType !== undefined)
                        ?  dynamicTitleByCommunityType
                        : $scope.dynamicTitleDefault
      ;
      if (updateScope) { $scope.dynamicTitle = dynamicTitle; }
      return dynamicTitle;
    };
    
    /**
     * Accordion
     */
    // default accordion state
    $scope.accordionOpen =  HistoryService.containsCount($state.current) < 2;
    // wait a small amount of time before closing the initially-open accordion
    $scope.accordionInitialCloseDelay = BrowserDetectionService.isMobile ? 0 : 500; // ms
    $scope.initAccordion    = function() { $timeout($scope.closeAccordion, $scope.accordionInitialCloseDelay); }
    $scope.openAccordion    = function() { $timeout(function() {$scope.accordionOpen = true;}, 0) };
    $scope.closeAccordion   = function() { $timeout(function() {$scope.accordionOpen = false;}, 0) };
    $scope.toggleAccordion  = function() {
      $timeout(function() {
        $scope.accordionOpen = !$scope.accordionOpen;
        if ($scope.accordionOpen) {
          $scope.filterSettingsChanged = false;
        } else {
          if ($scope.filterSettingsChangedEver) {
            $state.go('communitiesByType', {'communityType': 'search'}, {});
          }
        }
      }, 0);
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
    $scope.filterSettingsChangedEver = false;
    $scope.filterData = function(newValues, oldValues, scope)
    {
      $timeout(function() {
        $scope.filteredCommunities = FilterService.filter_communities($scope.communities);
        if ($scope.filteredCommunities.length < 1) {$scope.stopLoadingAnimation(true);}
        $scope.filterSettingsChanged = false;
        $scope.clickables = FilterService.getClickables(); 
      }, 0);
    };
    $scope.$watchGroup(
      [
        "FilterService.settings.communities.cityOrZip",
      ]
      , 
      function() {
        $scope.filterSettingsChanged = true;
      }
    );
    $scope.$watchGroup(
      [
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
        "FilterService.settings.communities.category_memberships[10]",
      ]
      , 
      function() {
        $scope.filterData();
        $scope.filterSettingsChanged = true;
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
      ]
      , 
      function() {
        $scope.updatePreviousRegionsSettings();
        $scope.filterData();
        $scope.filterSettingsChanged = true;
      }
    );
    $timeout(function() {
      $scope.$watch('filterSettingsChanged', function(newValue, oldValue) {
        // console.log('filterSettingsChanged newValue: ', newValue);
        $scope.filterSettingsChangedEver = true;
        if (newValue === true 
         && $state.current.name !== 'search'
        ) {
          $scope.communityType = 'search';
          $scope.detectDynamicTitle();
          FilterService.settings.communities.isCustomFilter = true;
        }
      });
    }, 2000);
    $scope.$watch('filterSettingsChangedEver', function(newValue, oldValue) {
      if (newValue === true) {
        FilterService.settings.communities.isCustomFilter = true;
      }
    });
    $scope.filterUpdate = function()
    {
      $timeout(function() {
        //$scope.filterData(); 
        $scope.toggleAccordion();
      }, 0);
    };
    $scope.setFilterToSingleRegion = function(region)
    {
      // console.log('setting filter region to region: ', region);
      for (var key in FilterService.settings.communities.regions) {
        FilterService.settings.communities.regions[key] = ( region.id.toString() === key.toString() )
      }
      // $scope.FilterService.initCategories();
      $scope.filterData();
    };  
    $scope.setFilterToSingleCareType = function(careType)
    {
      // console.log('setting filter careType to careType: ', careType);
      for (var key in FilterService.settings.communities.category_memberships) {
        FilterService.settings.communities.category_memberships[key] = ( careType.id.toString() === key.toString() )
      }  
      // $scope.FilterService.initRegions();
      $scope.filterData();
    };
    $scope.setFilterCityOrZip = function(cityOrZip)
    {
      // console.log('setting filter cityOrZip: ', cityOrZip);
      // not doing anything, default behavior is already the expected behavior.. --jle
    };
    
    /**
     * Previous Settings
     */
    $scope.initPreviousRegionSettings = function()
    {
      $scope.previousFilterRegionsSettings = (
            FilterService.settings.communities.cityOrZip !== undefined
         && FilterService.settings.communities.cityOrZip !== null
         && FilterService.settings.communities.cityOrZip.trim() !== ''
      ) 
        ? {
            'all' : true,   // all regions
                1 : false,  // North
                2 : false,  // South
                3 : false,  // East
                4 : false,  // West
                5 : false,  // Inner I-65
        }
        : {}
      ;
    };
    $scope.updatePreviousRegionsSettings = function()
    {
      var previousSettings = angular.copy(FilterService.settings.communities.regions);
      // console.log('CommunitiesCtrl updating previous settings to:  ', JSON.stringify(previousSettings));
      $scope.previousFilterRegionsSettings = previousSettings;
    };
    $scope.restorePreviousRegionsSettings = function()
    {
      // console.log('CommunitiesCtrl restoring previous settings: ', $scope.previousFilterRegionsSettings);
      angular.extend(FilterService.settings.communities.regions, $scope.previousFilterRegionsSettings);
    };
    
    
    
    /**
     * cityOrZip 
     */
    $scope.citiesAndZips = citiesAndZips.cities.concat(citiesAndZips.zips);
    
    $scope.initRegionsDisabled = function() 
    {
      $scope.regionsDisabled =  (  FilterService.settings.communities.cityOrZip !== undefined 
                              && FilterService.settings.communities.cityOrZip !== null
                              && FilterService.settings.communities.cityOrZip.trim !== ''
                              )
      ;
    };
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
      $scope.initRegionsDisabled();
    });
    $scope.$watch('FilterService.settings.communities.cityOrZip', function(newValue, oldValue) {
      // console.log('cityOrZip newValue: ', newValue);
      if (newValue === undefined || newValue === null || newValue.trim() === '') {
        $timeout(function() {
          $scope.regionsDisabled = false;
          if ($scope.previousFilterRegionsSettings !== null) {
            $scope.restorePreviousRegionsSettings();
          }
          $scope.filterData();
        }, 0);
      } else {
        $timeout(function() {
          $scope.regionsDisabled = true;
          $scope.filterData();
        }, 0);
      }
    });
    $scope.cityOrZipIsOpen = null;
    $scope.initCityOrZipDropDown = function() { 
      if (FilterService.settings.communities.cityOrZip === null) {
        FilterService.settings.communities.cityOrZip = ''; 
      }
    };
    $scope.emptyCityOrZipIfNotValid = function()
    {
      FilterService.settings.communities.cityOrZip = 
        (FilterService.settings.communities.cityOrZip === undefined)
          ? null
          : FilterService.settings.communities.cityOrZip
      ;
    };


    /**
     * URL/appState-driven FilterService settings
     */
    $scope.careTypeCategoryIDs = {
      // communityType      // id
      'maintenanceFree'     : 1,
      'independentLiving'   : 2,
      'ccrc'                : 3,
      'assistedLiving'      : 4,
      'homeCare'            : 5,
      'onSiteHomeCare'      : 6,
      'respiteCare'         : 7,
      'memoryCare'          : 8,
      'rehab'               : 9,
      'nursingCare'         : 10,
    };
    $scope.setFilterByCommunityType = function() {
      if ($scope.communityType === 'search') {return;}
      FilterService.initCategories();
      FilterService.settings.communities.category_memberships['all'] = false;
      FilterService.settings.communities.category_memberships[ $scope.careTypeCategoryIDs[$scope.communityType] ] = true;
      $scope.filterData();
    };


    

    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-communities'
    };
    $scope.omnitureDelay = 1000; // ms
    $scope.reportToOmniture = function() {
      if (!AppConfig.omniture.reportingEnabled) {return;}
      // console.log('reporting to omniture: ', $scope.omniture);
      $timeout(function() {
          OmnitureService
              .set('extension',   $scope.omniture.extension)
              .report()
          ;                    
      }, $scope.omnitureDelay);
    };

    
    /**
     * Search Dropdowns  
     */
    $scope.dropdownRegions = false;
    $scope.dropdownCareTypes = false;
    
		$scope.handleDropdownRegions = function() {
			$scope.dropdownCareTypes = false;
			$scope.dropdownRegions = !$scope.dropdownRegions; 
		};
		$scope.handleDropdownCareTypes = function() {
			$scope.dropdownRegions = false;
			$scope.dropdownCareTypes = !$scope.dropdownCareTypes; 
		};
		
		/* dropdown buttons -kpm */
    $scope.hideAllDropdowns = function()
    {
      $scope.dropdownCareTypes = false;
      $scope.dropdownRegions = false;
    }


    
    /* kick it off */
    $scope.main();
      
  } // end function
]) // end controller

;