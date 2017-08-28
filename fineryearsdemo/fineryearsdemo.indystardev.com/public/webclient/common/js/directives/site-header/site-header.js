/* globals angular, $ */
window.scriptBasepath.detectFor('SiteHeaderDirective');
angular.module('SiteHeaderDirective', [
  
])
.directive('siteHeader', function() {
  return {
    
    restrict: 'E',
    templateUrl: 'common/js/directives/site-header/site-header.html',
    scope: {
			// selected : '=?'
		},
		transclude: false,
		controller: [
			'$scope',
			'$timeout',
			'$state',
			'$window',
			'$uibModal',
			'SiteHeaderService',
			'BrowserDetectionService',
			'AuthService',
			'FilterService',
		function(
			$scope,
			$timeout,
			$state,
			$window,
			$uibModal,
			SiteHeaderService,
			BrowserDetectionService,
			AuthService,
			FilterService
		) 
		{
			// ** debug ** //
			window.appDebug.SiteHeaderCtrl = $scope;


			/**
			 * Scope Initialization
			 */
			// for loading css from directive folder
			$scope.directiveBasepath = window.scriptBasepath.for('SiteHeaderDirective');

			$scope.defaults = {
				
			};
			angular.extend($scope, 
				angular.extend({}, $scope.defaults, $scope)
			);
			// services
			$scope.SiteHeaderService = SiteHeaderService;
			$scope.$state = $state;
			
			// event deregistration
			$scope.deregister = {};

			// guest authentication
			$scope.AuthServiceGuest = AuthService.guest.get();

			/**
			 * Controller entry
			 */
			$scope.main = function() {
				$timeout(function() {
					$scope.resetHighlightedMenuItem(0);
					$scope.resetHighlightedSubmenuItem();
					$scope.initSubmenus();	
				});
			};
			

			
			/**
			 * Menu hovering
			 */
			$scope.highlightedMenuItem = null;
			$scope.highlightMenuItem = function(item) {
				$timeout.cancel($scope.resetHighlightedMenuItem_promise);
				$scope.highlightedMenuItem = item; 
			};
			$scope.resetHighlightedMenuItemDelay = 150; // ms
			$scope.resetHighlightedMenuItem = function(delay) { 
				if (delay === undefined) { delay = $scope.resetHighlightedMenuItemDelay; }
				$scope.resetHighlightedMenuItem_promise =
					$timeout(
						function() {
							if (this.fromItem === this.scope.highlightedMenuItem) {
								this.scope.highlightedMenuItem = null; 	
							}
						}.bind({scope: $scope, fromItem: $scope.highlightedMenuItem}), 
						delay
					)
				;
			};
			$scope.deregister.highlightedMenuItem_stateChangesuccess = 
				$scope.$root.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
					$scope.closeMenu();
				})
			;
			
			/**
			 * Submenu hovering
			 */
			$scope.highlightedSubmenuItem = null;
			$scope.highlightSubmenuItem = function(item) 
			{
				$scope.highlightedSubmenuItem = item;
			};
			$scope.resetHighlightedSubmenuItem = function() {
				$scope.highlightedSubmenuItem = SiteHeaderService.get('communityType');
			};
			

			/**
			 * Burger Menu
			 */
			$scope.showMenu = false;
			$scope.toggleMenu = function() { 
				$scope.showMenu = !$scope.showMenu; 
			};
			$scope.closeMenu  = function() { 
				$scope.showMenu = false; 
			};
			
	
			/**
			 * Submenus
			 */
			$scope.showSubmenuDefaults = {
				communities: false, 
				home: false, // not used, included as an example
			};
			$scope.initSubmenus = function() {
				$scope.showSubmenu		= angular.extend({}, $scope.showSubmenuDefaults);
			};
			$scope.displaySubmenu 	= function(item) { $scope.showSubmenu[item] = true;	};
			$scope.hideSubmenu			= function(item) { $scope.showSubmenu[item] = false;	};
			$scope.toggleSubmenu		= function(item) { $scope.showSubmenu[item] = !$scope.showSubmenu[item]; }
			$scope.hideAllSubmenus	= function() {
				$scope.resetHighlightedSubmenuItem();
				for (var key in $scope.showSubmenu) { $scope.hideSubmenu(key); } 
			};
			// scope registered event
	    $scope.deregister.submenu_stateChangeSuccess =
	    	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $scope.hideAllSubmenus();
	    });
			
		  /**
	     * Site Header Location Update
	     */
	     // scope registered event
	    $scope.$state = $state;
	    $scope.deregister.siteHeaderLocation_stateChangeSuccess =
		    $scope.$root.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		      SiteHeaderService.updateLocation(toState);
		      if ($state.current.name === 'care') {
		      	$scope.communityType = 'careTypes';
		      } else if ($state.current.name === 'communities' && $state.params.communityType === undefined) {
		      	$scope.communityType = 'allCommunities';
		      } else {
		      	$scope.communityType = $state.params.communityType;
		      }
		      SiteHeaderService.communityType($scope.communityType);
		    })
	    ;
			
			/**
			 * UI State Conditional hiding
			 * 
			 *
			$scope.conditionallyHide = function(event, toState, toParams, fromState, fromParams)
			{
				if (toState === undefined) {toState = event;}
				if (toState === undefined) {toState = $state.current;}
				//console.log('conditionally hiding on state: ', toState);
				$timeout(function() {
					$scope.hiddenOnState = ($scope.hiddenOnStates.indexOf(toState.name) !== -1);
				})
			};
			$scope.conditionallyHide();
			$scope.$on('$stateChangeStart', $scope.conditionallyHide);
			$scope.$on('$stateChangeSuccess', $scope.conditionallyHide);
			*/
			
			/**
			 * "Find Senior Living" button - display conditional on router state
			 */
			$scope.showFindSeniorLivingButtonStates = [
				//'home',
				'community',
				'communityById',
				'communityByIdWithName',
				'communities',
				'communitiesByType',
				'about',
				'map',
				'care',
				'saved',
				'advertise'
			];
			$scope.updateFindSeniorLivingButtonForState = function(state) {
				if (state === undefined) {state = $state.current.name;}
				$scope.showFindSeniorLivingButton = $scope.showFindSeniorLivingButtonStates.indexOf(state) !== -1;	
			};
			$scope.updateFindSeniorLivingButtonForState();
	    $scope.deregister.updateFindSeniorLivingButton_stateChangeStart = 
	    	$scope.$root.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
	      	$scope.updateFindSeniorLivingButtonForState(toState.name);
		    })
		  ;
    	$scope.deregister.updateFindSeniorLivingButton_stateChangeSucess = 
	    	$scope.$root.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
	      	$scope.updateFindSeniorLivingButtonForState(toState.name);
		    })
		  ;
	    

			/**
			 * Event de-registration
			 */
	    $scope.deregisterAllScope = function()
	    {
	    	for (var key in $scope.deregister) {
	    		var deregisterFunction = $scope.deregister[key];
	    		console.log('deregisterFunction: ', deregisterFunction);
	    		deregisterFunction();
	    	}
	    };
	    $scope.deregister.allScope = $scope.$on('$destroy', $scope.deregisterAllScope);
	    
	    
			/**
			 * Responsive mobile detection
			 */
			$scope.mobileBreakpoint = 768;
			$scope.detectDeviceType = function(updateScope) 
			{
				if (updateScope === undefined) { updateScope = true; }
				var deviceType	= ($window.innerWidth < $scope.mobileBreakpoint)
												? 'mobile'
												: 'desktop'
				;
				if (updateScope) { 
					$timeout(function() {
						$scope.deviceType = deviceType; 
					});					
				}
				return deviceType;
			};
			angular.element($window).bind('resize', $scope.detectDeviceType);
			$scope.detectDeviceType();
			
			/**
			 * Device Conditional handling of Living & Care click
			 */
			$scope.livingCareClicks = 0;
			$scope.handleLivingAndCareClick = function()
			{
				
				// count care clicks
				$scope.livingCareClicks++;

				// if it's mobile, close the burger-menu and goto care
				if ($scope.deviceType === 'mobile') {
					$scope.closeMenu();
					$state.go('care', {});
					return;
				}
			
				// otherwise.. if it's not ipad and only 1 care-click has happened, ignore that click
				if ($scope.livingCareClicks < 2 && !BrowserDetectionService.isiPad) { return; }

				// otherwise.. toggle communities submenu
				$scope.toggleSubmenu('communities');

			};
			

			/**
			 * Saved Searches
			 */
			$scope.goToSaved = function()
			{
				AuthService.guest.ensureLoggedIn()
					.then(
						// if user is logged in
						function(response) {
							// console.log('user is logged in');
							$state.go('saved', {}, {});
						},
						// if user is not logged in
						function(response) {
							// console.log('user is not logged in');
							// do nothing..
						}
					)
				;
			};
			
			$scope.logout = function()
			{
				$timeout(function() {
					AuthService.guest.logout();	
				})
				.then(function() {
					$scope.closeMenu();
					if ($state.current.name === 'saved') {
						// console.log('$state.current.name: ', $state.current.name);
						$state.go('home', {}, {})
					}
				});
			};
			
			

			// ** kick it off..
			$scope.main();
			
		}] // end controller

  }; // end return directive provider object
}) // end directive

.factory('SiteHeaderService', [
	'$q',
	'$state',
	'$rootScope',
	'AppConfig',
	'FilterService',
	function(
		$q,
		$state,
		$rootScope,
		AppConfig,
		FilterService
	)
	{
		return {
			
			state : {
				// defaults
				currentLocation: null,
				communityType : null
			},
			get : function(key) {
				return this.state[key];
			},
			set : function(key, value) {
				this.state[key] = value;
				return this;
			},
			ignoreLocations: [
				
			],
			updateLocation: function(toState)
			{
				if (this.ignoreLocations.indexOf(toState.name) === -1) {
					this.set('currentLocation', toState.name);
				}
			},
			communityType: function(communityType)
			{
				if (communityType === undefined) { communityType = null; }
				this.set('communityType', communityType);
			},
						/**
			 * Go To Communities
			 */
			goToCommunities : function(careType)
			{
				// console.log('SiteHeaderCtrl goToCommunities() careType: ', careType);
				FilterService.init();
				if (careType === 'all') {
					$state.go('communities', {}, {});
				} else {
					$state.go('communitiesByType', {communityType: careType}, {});
				}
			},
			

		} // end return 
		
	} // end function()
]) // end service factory

; // end module