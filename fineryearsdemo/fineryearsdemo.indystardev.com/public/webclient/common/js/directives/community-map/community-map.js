/* globals $, angular, MarkerWithLabel, google, debounce */
window.scriptBasepath.detectFor('CommunityMapDirective');
angular.module('CommunityMapDirective', [
  'ngMap'
])
.directive('communityMap', [
	'$window',
	'$timeout',
	'BrowserDetectionService',
	function(
		$window,
		$timeout,
		BrowserDetectionService
	) {
	  return {
	    
	    restrict: 'E',
	    templateUrl: 'common/js/directives/community-map/community-map.html',
	    scope: {
				// selected : '=?'
				
				// if undefined, gets from CommunitiesService
				communities	: '=?',
				openCommunity: '=?',
				
				// if undefined, uses the id of the parent element
				containerId : '=?',
				
				// array, con contain these values: ['zoom', 'streetview', 'terrain'], if undefined - empty array
				hideControls : '@',
				// boolean, overlay we use to ensure smooth scrolling over map overlay (filter/results/etc) - if undefined, true
				includeOverlay : '@',
				initialZoom: '=?',
				includeResetControl: '@',
				resetControlPosition: '@',
				busyMessage: '=?',
				spinnerOptions: '@?',
				showLoadingAnimation: '=?'
			},
			transclude: false,
			link: function(scope, element, attrs) {
				// debug
				if (window.appDebug.CommunityMapCtrls === undefined) {
					window.appDebug.CommunityMapCtrls = [];
				}
				window.appDebug.CommunityMapCtrls.push(scope);
				// for loading css from directive folder
				scope.directiveBasepath = $window.scriptBasepath.for('SiteHeaderDirective');
				// window resize -- re-init map, resize infoWindows maxWidth
				var debounced = debounce(
					function() {
						scope.setInitialZoom();
						scope.onResizeAdjustMap();
					},
	    		150 // in ms
				);
    		angular.element($window).bind('resize', debounced);
    		scope.$on('$destroy', function() {
    			angular.element($window).unbind('resize', debounced);
    		});
				

			}, // end link: function() {}
			controller: [
				'$scope',
				'$element',
				'$timeout',
				'$window',
				'$templateRequest',
				'$interpolate',
				'$compile',
				'$state',
				'CommunityMapService',
				'CommunitiesService',
				'MarkersService',
				'NgMap',
				
			function(
				$scope, 
				$element, 
				$timeout,
				$window,
				$templateRequest,
				$interpolate,
				$compile,
				$state,
				CommunityMapService,
				CommunitiesService,
				MarkersService,
				NgMap
			) 
			{
				$scope.showLoadingAnimation = ($scope.showLoadingAnimation !== undefined)
																		? $scope.showLoadingAnimation
																		: false
				;
				
				// controller-specific stateful service
				$scope.CommunityMapService = CommunityMapService;
				
				/**
				 * Initialize Scope
				 */
				// generate unique map id
				var numChars = 8;
    		// http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    		$scope.mapId = 'map_' + Array(numChars+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, numChars);
    		
    		$scope.componentKey = 'community-map-' + $scope.mapId;
    		
				// indianapolis lat, lng
				$scope.indianapolisOnDesktop 	= [39.80037683881158, -85.96419525146486];
				$scope.indianapolisOnMobile 	= [39.79721155273212, -86.15508270263673];

				
				// this code is used in map.js as well, should be extracted to a shared service..
				$scope.mobileBreakpoint = 721;
				
				// defaults and attribute normalization
				$scope._hideControls		= $scope.$eval($scope.hideControls);
				$scope._includeOverlay	= ($scope.includeOverlay	=== 'false')	? false : true;
				
				$scope._includeResetControl 	= ($scope.includeResetControl === 'true') ? true : false;
				$scope._resetControlPosition	= ($scope.resetControlPosition !== undefined)
																			? $scope.resetControlPosition
																			: 'BOTTOM_RIGHT'
				;
				
				$scope.setInitialZoom = function(zoom) {
						if (zoom !== undefined) {return $scope._initialZoom = zoom;}
						$scope._initialZoom	= ($scope.initialZoom !== undefined)
								? parseInt($scope.initialZoom, 10) 
								: 10
						;
				};
				$scope.setInitialZoom();	
				$scope.$watch('initialZoom', function(newValue, oldValue) {
					if (newValue === undefined || newValue === null) {newValue = 10;}
					if (oldValue === undefined || oldValue === null) {oldValue = 10;}
					if (newValue === oldValue) {return;}
					$scope.setInitialZoom(newValue);
					$scope.map.setOptions({animatedZoom: false});
					$scope.map.setZoom($scope._initialZoom);
					//google.maps.event.trigger($scope.map, 'resize');
					$timeout(function() {
						$scope.map.setOptions({animatedZoom: true});
					}, 1000);

					
				});
				
				$scope.detectMapWidth = function(updateScope)
				{
					if (updateScope === undefined) {updateScope = true;}
					
					var width = 0;
					if ($scope.containerId === undefined) {
						$scope.containerId = $element.parent().attr('id');
					}
					if ($('#' + $scope.containerId)[0] !== undefined ) {
						width = $('#' + $scope.containerId).width();
					}
					if (updateScope) { $scope.mapWidth = width; }
					
					return width;
				};
				
			  $scope.detectMapType = function()
			  {
			  	$scope.detectMapWidth();
			  	$scope.mapType  = $scope.mapWidth > $scope.mobileBreakpoint
		                      ? 'desktop'
		                      : 'mobile'
		      ;
		      return $scope.mapType;
			  };
				$scope.isMapVisible = function()
				{
					return $scope.detectMapWidth(false) > 0;
				};
				$scope.calculateCenter = function() 
				{
					$scope.detectMapType();
					
					// if we have exactly one community, and no overlay
					if ($scope.communities !== undefined
					 && $scope.communities[0] !== undefined
					 && $scope.communities !== null
					 && $scope.communities.length === 1
					 && $scope._includeOverlay === false
					) {
						// use it's location as map center
						// console.log('using single marker as center');
						$scope.initialCenter = [
							parseFloat($scope.communities[0].lat),
							parseFloat($scope.communities[0].lng)
						];
					} else { // otherwise..
						// console.log('using indianapolis as center');
						$scope.initialCenter = ($scope.mapType === 'mobile')
										? $scope.indianapolisOnMobile
										: $scope.indianapolisOnDesktop
						;
					}
					return $scope.initialCenter;
				};

				
				// defaults
				$scope.defaults = {
				  map						: null,
				  initialCenter	: $scope.calculateCenter(),
				  initialZoom		: $scope._initialZoom,
				  closeInfoWindowsOnMapClick : true
				};
				angular.extend( $scope, angular.extend({}, $scope.defaults, $scope) );
				
				// controller entry
				$scope.main = function() {
				  // console.log('CommunityMapCtrl.main()');
				  if ($scope.mapInitPromise === undefined) {
				  	$scope.initMap();
				  	$scope.mapInitPromise.then(function(map) {
				  		$scope.map = map;
				  		$scope.initMarkers(map);
				  	});
				  }
				  
				};
				
				$scope.initMap = function(override) 
				{
					if (override === undefined) {override = false;}
					if ($scope.mapInitPromise === undefined || override) {
				  	$scope.mapInitPromise = NgMap.getMap(
					  	{id: $scope.mapId}
				  	);
				  	
				  	$scope.mapInitPromise
						  .then(function(map) {
					  		// console.log('got map: ', map);
					  		$scope.registerMapListeners(map);
					  		$scope.map = map;
						    map.mapId = $scope.mapId;
						    
						    // move the map controls from their default positions
								MarkersService.setting('map', $scope.map);
								
						    // markers init
						    if ($scope._hideControls === undefined) {$scope._hideControls = [];}
						    
						    $scope.map.setOptions({
						    	streetViewControl : $scope._hideControls.indexOf('streetview') === -1,
						    	streetViewControlOptions : {
			              position: google.maps.ControlPosition.LEFT_BOTTOM
			          	},
			          	zoomControl : $scope._hideControls.indexOf('zoom') === -1,
						    	zoomControlOptions: { 
						    		position: google.maps.ControlPosition.LEFT_BOTTOM
						    	},
						    	mapTypeControl : $scope._hideControls.indexOf('terrain') === -1,
						    });
						    
						    // attach map reset control/button
						    if ($scope._includeResetControl
						     && $scope.resetControlDiv === undefined
						    ) 
						    {
						    	var position = google.maps.ControlPosition[$scope._resetControlPosition];
						     	$scope.resetControlDiv		= document.createElement('div');
							   	$scope.createResetControl($scope.resetControlDiv);
						    	$scope.map.controls[position].push($scope.resetControlDiv);
						    }
						    
						    // $scope.initMarkers();
		
					    	$scope.calculateCenter();
					    	if ($scope._includeOverlay) { $scope.addOverlayUnderlay(); }
								$scope.onResizeAdjustMap();
		
								$timeout(function() {
									if ($scope.openCommunity) {
										var panel = $('.map-results-panel').first();
										if (!panel.hasClass('ng-hide')) {
											var offsetx = (panel.width() * .4 ) * -1;
											var offsety = 70;
										} else {
											var offsetx = 0;
											var offsety = 40;
										}
										
										MarkersService.openInfoWindowByCommunityId(
											$scope.openCommunity, 
											{center: true,
			  							 offsetx: offsetx,
											}
										);
									}
								}, 500);
		
						  }) // end then
						  .catch(function(response) {
						  	console.log('error getting map, response: ', response); 
						  	$timeout(function() {
						  		$scope.main();
						  	}, 300);
						  })
						;
				  } // end if
					
					
					return $scope.mapInitPromise;
				}; // end $scope.initMap();
				// register event listeners on map -- https://developers.google.com/maps/documentation/javascript/reference#Map
				$scope.registerMapListeners = function(map)
				{
					if (map === undefined) {map = $scope.map;}
					if (map === undefined || map === null) {return;}
					/*
					console.log('registering map listeners');
					google.maps.event.addListener(map, 'tilesloaded', function(){
					   console.log('map tilesloaded');
					});
					google.maps.event.addListenerOnce(map, 'idle', function(){
					   console.log('map idle');
					});
					*/
					/*
			  	google.maps.event.addListenerOnce(map, 'bounds_changed', function(){
					   console.log('map bounds_changed');
					});
			  	*/
				};
				
				
				$scope.closeAllWindowsClickHandlerBound = false;
				$scope.initMarkers = function(map) 
				{
					if (map !== undefined && $scope.map === undefined) {$scope.map = map;}
					// console.log('CommunityMapCtrl.initMarkers(), map: ', $scope.map);
					if ($scope.map === null) {return}
			    if ($scope.communities === undefined) {
			  	  CommunitiesService.getCommunities()
				    	.then(function(communities) {
				    		$scope.communities = communities;
				    		$scope.calculateCenter();
					    	MarkersService.setMarkers($scope.communities);
					    	$scope.mapHasLoaded();
					    })
				    ;
			    } else {
			    	MarkersService.setMarkers($scope.communities);
				    $scope.mapHasLoaded();
			    }
			    
					// map, close marker infowindows on click
			    if ($scope.closeInfoWindowsOnMapClick) {
			    	if ($scope.map !== undefined && !$scope.closeAllWindowsClickHandlerBound) {
			    		$scope.closeAllWindowsClickHandlerBound = true;
				    	google.maps.event.addListener($scope.map, "click", function(event) {
								MarkersService.closeAllInfoWindows();
							});		
			    	}
			    }
			    
			    
				};
				
				$scope.hasMapLoaded = false;
				$scope.mapHasLoaded = function()
				{
					$scope.hasMapLoaded = true;
					// console.log('markers initialized');
		    	$scope.$root.$broadcast('component-loaded', 
		    		{
		    			key: $scope.componentKey
		    		}
	    		);
				};
				
				$scope.$on('MapCtrl::filterRefreshed', function(event, args) {
					// console.log('CommunityMapCtrl heard MapCtrl::filterRefreshed');
					MarkersService.closeAllInfoWindows();
					$scope.initMarkers();
				});
				
				/**
				 * Watch for changes top openCommunity
				 */
				$scope.$on('community-map:refresh', function(event, args) {
					// console.log('CommunityMapCtrl heard community-map:refresh event: ', event, ' args: ', args);
					var openCommunity = (args !== undefined && args.openCommunity !== undefined)
														? args.openCommunity
														: $scope.openCommunity
					;
					
					if (BrowserDetectionService.isIE) {
					
						if (openCommunity !== undefined
						 && openCommunity !== null
						 && openCommunity.toString().trim() !== ''
						) {
							this.mapInitPromise.then(
								function() {
									$timeout(function() {
										MarkersService.openInfoWindowByCommunityId(this.openCommunity.toString());
									}.bind(this), 0);
								}.bind({openCommunity: openCommunity})
							);
						}
						
					} else { // end if BrowserDetectionService.isIE
						
						// doesn't work in IE - but works best in other browsers
						$scope.openCommunity = openCommunity;
						$scope.initMap(true);

					} // end if/else BrowserDetectionService.isIE
					
				}.bind($scope));
				
				
				/**
				 * Markers
				 */
	      $scope.closeAllInfoWindows = function() { MarkersService.closeAllInfoWindows(); };

				/**
				 * On Resize
				 */
				$scope.onResizeAdjustMap = function()
				{
					if ($scope.map === undefined || $scope.map === null) { return; }
					// adjust maxWidth of infowindow (and redraw it)
					MarkersService.reCalculateInfoWindowsMaxWidth();
					// if the window is open..
					var currentInfoWindow = MarkersService.setting('currentInfoWindow');
					if (		currentInfoWindow !== null
							&&	currentInfoWindow.isInfoWindowOpen) 
					{
						if (window.innerWidth < 768) {
							$scope.resetCenterToMarkers();
						}
					} else { // otherwise..
						// pan the map to it's original center position
						// $scope.map.panTo({lat: $scope.initialCenter[0], lng: $scope.initialCenter[1]});
						// console.log('no currentInfoWindow, setting map)')
						$scope.map.setCenter({lat: $scope.initialCenter[0] , lng: $scope.initialCenter[1]});
					}
					// restore initial zoom
				  $scope.map.setOptions({zoom: $scope._initialZoom});
					$scope.redrawMap();
				};
				
				$scope.resetCenterToMarkers = function() {
					// pan the map to center the marker in the map
					var currentMarker = MarkersService.setting('currentInfoWindowMarker');
					if (currentMarker && currentMarker !== null) {
						var currentMarkerPosition	= MarkersService.setting('currentInfoWindowMarker').getPosition();
						//$scope.map.panTo({lat: currentMarkerPosition.lat(), lng: currentMarkerPosition.lng()});
						var lat = currentMarkerPosition.lat();
						var lng = currentMarkerPosition.lng()
							// do some translation to get this to pixels, to detect overlap with overlay, etc.
						;
						$scope.newCenter = {lat: lat, lng: lng};
					} else {
						$scope.newCenter = (window.innerWidth < $scope.mobileBreakpoint) 
							? {lat: $scope.indianapolisOnMobile[0], lng: $scope.indianapolisOnMobile[1]}
							: {lat: $scope.indianapolisOnDesktop[0], lng: $scope.indianapolisOnDesktop[1]}
						;
						$scope.map.setCenter($scope.newCenter);
					}
										


				};
				$scope.$on('mapNeedsCenterReset', function(event, args) {
					console.log('CommunityMapCtrl heard mapNeedsCenterReset');
					$scope.resetCenterToMarkers();
				});
				
				$scope.addOverlayUnderlay = function()
				{
					if ($scope.overlayUnderlay !== undefined) {return;}
					$scope.overlayUnderlay = document.createElement('div');
					$scope.overlayUnderlay.className = 'map-overlay-underlay';
					
					$scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($scope.overlayUnderlay);
				};
	
				/**
				 * Adjust when maptype changes
				 */
				 
				$scope.$on('map-type-changed', function(event, args) {
					if (args.mapType !== $scope.mapType) 
					{ 
						$scope.mapType = args.mapType; 
					}
				});
				$scope.$watch('mapType', function(toValue, fromValue) {
					if (!$scope.isMapVisible()) {return;}
					if ($scope.map === null) {return;}
					window.getGlobalGoogleMaps.then(function() {
						$timeout(function() {
							$scope.calculateCenter();
							$scope.map.setCenter({lat: $scope.initialCenter[0] , lng: $scope.initialCenter[1]});
							$scope.resetCenterToMarkers();
							$scope.redrawMap();	
						}, 100);	
					});
				});
				
				
				$scope.$on('map-tab-changed', function(event, args) {
					if ($scope.map === null) {return;}
					if (args.mapType !== undefined) {$scope.mapType = args.mapType;}
					if (args.mapType === 'mobile') {MarkersService.closeAllInfoWindows();}
					$scope.map.setOptions({zoom: $scope._initialZoom});
					if (args.toTab === 'map' 
					 && (		window.innerWidth < 768
						   || $state.current.name === 'saved'
						  )
					 ) {
						$timeout(function() {
			 				$scope.calculateCenter();
							$scope.map.setCenter({lat: $scope.initialCenter[0] , lng: $scope.initialCenter[1]});
							$scope.redrawMap();	
							$scope.onResizeAdjustMap();
			  		}, 100);
					} 
				});
				
				/**
				 * Map Reset Button - Custom Google Maps UI Control
				 */
				$scope.createResetControl = function(controlDiv) 
				{
					
					// exterior of control
					controlDiv.pointer = 'cursor';

					var controlUI = document.createElement('div');
	        controlUI.title = 'Click to reset the map';
	        controlDiv.appendChild(controlUI);
					
					// interior of control
	        var controlText = document.createElement('div');
	        controlText.className = 'map-reset';
	        controlText.innerHTML = '<i class="icon icon-target"></i>';
	        controlUI.appendChild(controlText);
	
	        // on click, reset map
	        controlDiv.addEventListener('click', function() {
	          $scope.onResizeAdjustMap();
	        });
	      };

	      
				// misc
				$scope.redrawMap = function()
				{
					MarkersService.redrawCurrentInfoWindow();
					google.maps.event.trigger($scope.map, 'resize');
				};
				
				/**
				 * Event binding
				 */
				 /*
				angular.element($window).bind('resize', $scope.onResizeAdjustMap);
				$scope.$on('$destroy', function() {
					angular.element($window).unbind('resize', $scope.onResizeAdjustMap);
				});
				*/
				
				// ** kick it off..
				$scope.main();


			}] // end controller
	
	  }; // end return directive provider object
	}
]) // end directive

.factory('CommunityMapService', [
	'$q',
	'$rootScope',
	'AppConfig',
	function(
		$q,
		$rootScope,
		AppConfig
	)
	{
		return {
			
			state : {
				// defaults
				map: null,
				mapMarkers: [],
				mapType: null,
			},
			get : function(key) {
				return this.state[key];
			},
			set : function(key, value) {
				this.state[key] = value;
				return this;
			}

		}; // end return 
		
	} // end function()
]) // end service factory

; // end module