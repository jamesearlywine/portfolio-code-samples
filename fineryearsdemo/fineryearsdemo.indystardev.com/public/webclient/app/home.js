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
      templateUrl: 'app/home.html',
      controller: 'HomeCtrl',
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
.controller('HomeCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'FilterService',
    'OmnitureService',
    'lodash',
    'citiesAndZips',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    FilterService,
    OmnitureService,
    _,
    citiesAndZips
) {
  
    /* debug */
    window.appDebug.HomeCtrl         = $scope;

    
    /* home controller entry */
    $scope.main = function() {


    };

    /**
     * cityOrZip dropdown
     */
    $scope.citiesAndZips = citiesAndZips.cities.concat(citiesAndZips.zips);
    $scope.previousFilterRegionsSettings = null;
    $scope.regionsDropDownDisabled = false;
    $scope.cityOrZipIsOpen = null;
    $scope.initCityOrZipDropDown = function() { 
      if (FilterService.settings.communities.cityOrZip === null) {
        FilterService.settings.communities.cityOrZip = ''; 
      }
    };
    
    /**
     * Previous Settings
     */
    $scope.initPreviousRegionSettings = function()
    {
      $scope.previousFilterRegionsSettings = (
            FilterService.settings.communities.cityOrZip === undefined
         || FilterService.settings.communities.cityOrZip === null
         || FilterService.settings.communities.cityOrZip.trim() === ''
      ) 
        ? {
            'all' : true,   // all regions
                1 : false,  // North
                2 : false,  // South
                3 : false,  // East
                4 : false,  // West
                5 : false,  // Inner I-65
        }
        : FilterService.settings.communities.regions
      ;
    };
    $scope.initPreviousRegionSettings();
    $scope.updatePreviousRegionsSettings = function()
    {
      var previousSettings = angular.copy(FilterService.settings.communities.regions);
      $scope.previousFilterRegionsSettings = previousSettings;
    };
    $scope.restorePreviousRegionsSettings = function()
    {
      angular.extend(FilterService.settings.communities.regions, $scope.previousFilterRegionsSettings);
    };
    

    /**
     * Filtering
     */
    $scope.FilterService = FilterService;
    // reset when user goes to the home page
    $scope.FilterService.init();
    $scope.careTypeNames = {
      'all': 'All Types',
      1: 'Limited Maintenance / Maintenance Free',
      2: 'Independent Living',
      3: 'Continuing Care Retirement Communities',
      4: 'Assisted Living',
      5: 'Home Care',
      6: 'On-Site Home Care',
      7: 'Respite Care',
      8: 'Memory Care',
      9: 'Rehabilitiation Care',
      10: 'Nursing / Specialty Care',
    };
    $scope.regionNames = {
      'all' : 'All Regions',
      1: 'North',
      2: 'South',
      3: 'East',
      4: 'West', 
      5: 'Inner I-465'
    };
    // display elements
    $scope.displayElementsDefaults = {
      careTypes: $scope.careTypeNames['all'],
      regions: $scope.regionNames['all']
    };
    $scope.displayElements = {};
    $scope.initDisplayElements = function() {
      angular.extend($scope.displayElements, $scope.displayElementsDefaults);
      $scope.updateDisplayElements();
    };
    $scope.updateDisplayElements = function(newValues, oldValues, scope)
    {
      $timeout(function() {
        
        // regions
        $scope.displayElements.regions = '';
        var regionIDs = _.transform(FilterService.settings.communities.regions, 
                                    function(result, value, key) {
                                      (result[value] || (result[value] = [])).push(key);
                                    }
                                  )
                      .true
        ;
        if ( !regionIDs 
         ||   regionIDs.length < 1 
         || ( regionIDs.indexOf('all') !== -1 )  
        ) {
          var cityOrZip = FilterService.settings.communities.cityOrZip;
          $scope.displayElements.regions  = (cityOrZip === null || cityOrZip === undefined || cityOrZip.trim() === '')
                                          ? $scope.regionNames['all']
                                          : '&nbsp;'
          ;
        } else {
          var counter = 0;
          for (var key in regionIDs) {
            var regionID = regionIDs[key];
            var isLast = !( counter < (regionIDs.length - 1) );
            var regionSelected = FilterService.settings.communities.regions[regionID];
            if (key !== 'all' && regionSelected) { 
              var regionName = $scope.regionNames[regionID];
              $scope.displayElements.regions += regionName;
              if (!isLast) {$scope.displayElements.regions += ', ';}
            } 
            counter++;
          }  
        } 
        
        // categories (careTypes)
        $scope.displayElements.careTypes = '';
        var categoryIDs = _.transform(FilterService.settings.communities.category_memberships, 
                                      function(result, value, key) {
                                        (result[value] || (result[value] = [])).push(key);
                                      }
                                    )
                        .true
        ;
        if ( !categoryIDs 
         ||   categoryIDs.length < 1 
         || ( categoryIDs.indexOf('all') !== -1 )  
        ) {
          $scope.displayElements.careTypes = $scope.careTypeNames['all'];
        } else {
          var counter = 0;
          for (var key in categoryIDs) {
            var categoryID = categoryIDs[key];
            var isLast = !( counter < (categoryIDs.length - 1) );
            var careTypeSelected = FilterService.settings.communities.category_memberships[categoryID];
            if (key !== 'all' && careTypeSelected) { 
              $scope.displayElements.careTypes += $scope.careTypeNames[categoryID];
              if (!isLast) {$scope.displayElements.careTypes += ', ';}
            }
            counter++;
          }  
        }
        
      }, 0);
      
    };
    
    $scope.initDisplayElements();
    // 
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
        $scope.filterSettingsChanged = true;
        $scope.updateDisplayElements();
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
      function(newValue, oldValue) {
        if (newValue === oldValue) {return;}
        $scope.filterSettingsChanged = true;
        $scope.updatePreviousRegionsSettings();
        $scope.updateDisplayElements();
      }
    );
    $scope.$watchGroup(
      [
        "FilterService.settings.communities.cityOrZip",
      ]
      ,
      function(newValue, oldValue) {
        if (Array.isArray(newValue)) {newValue = newValue[0];}
        if (Array.isArray(oldValue)) {oldValue = oldValue[0];}
        if (newValue === undefined || newValue === null) {newValue = '';}
        if (newValue === oldValue) {return;}
        $scope.updateDisplayElements();
        if (newValue.trim() === '') 
        {
          $timeout(function() {
            $scope.regionsDropDownDisabled = false;
            $scope.restorePreviousRegionsSettings();  
          }, 0);
        } else {
          $timeout(function() {
            $scope.regionsDropDownDisabled = true;
          }, 0);
        }
        $scope.filterSettingsChanged = true;
      }
    );
    
    
    
    
    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-home'
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
    
    $scope.emptyCityOrZipIfNotValid = function()
    {
      FilterService.settings.communities.cityOrZip = 
        (FilterService.settings.communities.cityOrZip === undefined)
          ? null
          : FilterService.settings.communities.cityOrZip
      ;
    }
    
    /**
     * Search Dropdowns  
     */
    $scope.dropdownRegions = false;
    $scope.dropdownCareTypes = false;
    
		$scope.handleDropdownRegions = function() {
		  if ($scope.regionsDropDownDisabled) {return;}
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
    $scope.$on('body::clicked', function(event) {
      $scope.hideAllDropdowns();
    });

    
    /* kick it off */
    $scope.main();
    
   
		
		
      
  } // end function
]) // end controller

;