/* globals angular */
window.scriptBasepath.detectFor('MapListCommunityDirective');
angular.module('MapListCommunityDirective', [
  
])
.directive('mapListCommunity', [
	'$window',
	function(
		$window	
	) {
		return {
		  
		  restrict: 'EA',
		  templateUrl: 'common/js/directives/map-list-community/map-list-community.html',
		  scope: {
				community : '=',
			},
			link: function(scope, element, attrs) {
				// debug
				/*
				if (window.appDebug.MapListCommunityCtrls === undefined) {
					window.appDebug.MapListCommunityCtrls = [];
				}
				console.log('initializing MapListCommunityCtrl scope: ', scope);
				*/
				if (window.appDebug.MapListCommunityCtrls === undefined) {window.appDebug.MapListCommunityCtrls = [];}
				window.appDebug.MapListCommunityCtrls.push(scope);
				
				// for loading css from directive folder
				scope.directiveBasepath = window.scriptBasepath.for('MapListCommunityDirective');
				// window resize 
				/*
				angular.element($window).bind('resize', function(){
		  		// ...
		    });
		    */
			},
			transclude: false,
			controller: [
				'$scope',
				'$transclude',
				'$timeout',
				'$window',
				'Analytics',
				'CommunitiesService',
				'FavoritesService',
				'AuthService',
				'MarkersService',
				'AppConfig',
			function(
				$scope, 
				$transclude,
				$timeout,
				$window,
				Analytics,
				CommunitiesService,
				FavoritesService,
				AuthService,
				MarkersService,
				AppConfig
			) 
			{
				
				/**
				 * Initialize Scope
				 */
				$scope.defaults = {
					
				};
				angular.extend( $scope, angular.extend({}, $scope.defaults, $scope) );
				$scope.urlFriendlyCommunityName = encodeURIComponent($scope.community.name).replace(/%20/g, '-');
				
				// controller entry
				$scope.main = function() {
					$scope.buildCategoryGrid ();
				};
		
				/**
				 * Refresh/init
				 */
				$scope.$on('favorites::updated', function(event, options) {
					// console.log('map-list-community ', $scope, ' heard favorites::updated with options: ', options);
					var defaultOptions = {
						delay: 0
					};
					if (options === undefined) {options = defaultOptions;} else {
						options = angular.extend(defaultOptions, options);
					}
					$timeout(function() {
						$scope.main();
					}, options.delay)
				});
		
				/**
				 * Favoriting
				 */
				$scope.toggleFavorited = function()
				{
					AuthService.guest.ensureLoggedIn()
						.then(
							// if user is logged in
							function(response) {
								// console.log('user is logged in');
								// toggle favorite
								$scope.community.isFavorited = !$scope.community.isFavorited;
								$timeout(function() {
									if ($scope.community.isFavorited) {
										$timeout(function() {
											FavoritesService.add($scope.community.id, {updateWebservice: true});
										}, 0);
									} else {
										$timeout(function() {
											FavoritesService.remove($scope.community.id, {updateWebservice: true});
										}, 0);
									}
								}, 0);
							},
							// if user is not logged in
							function(response) {
								// console.log('user is not logged in');
								// do nothing..
							}
						)
					;

				};
				
				/**
				 * Record email-click
				 */
				$scope.recordEmailClick = function()
				{
				  var name = encodeURIComponent($scope.community.name).replace(/%20/g, '-');
				  var communityIdentifier = ''
				      + $scope.community.id
				      + '_'
				      + name
			      ;
			      // console.log('recording event \'ad-click\', communityIdentifier: ' + communityIdentifier);
			      Analytics.trackEvent('email-click', communityIdentifier);
				};
				
				

				/*
				$scope.$watch('community.isMarkerHovered', function(newValue, oldValue) {
					console.log('MapListCommunityCtrl community.isMarkerHovered changed, newValue: ', newValue, ' oldValue: ', oldValue);	
				});
				*/
	
				$scope.categoriesById   = {};
				$scope.buildCategoryGrid = function() {
					for (var key in $scope.community.category_memberships) {
						var categoryMembership = $scope.community.category_memberships[key];
						$scope.categoriesById[categoryMembership.category.id] = true;
					}
				};
				
				$scope.growMarker = function()
				{
					if (AppConfig.MarkersService.hoverEffectOnListItemHover) {
						var communityId = parseInt($scope.community.id, 10);
						MarkersService.growMarkerByCommunityId(communityId);	
					}
				};
				$scope.ungrowMarker = function()
				{
					if (AppConfig.MarkersService.hoverEffectOnListItemHover) {
						var communityId = parseInt($scope.community.id, 10);
						MarkersService.ungrowMarkerByCommunityId(communityId);
					}
				};
				
		
				// ** kick it off..
				$scope.main();
				
			}] // end controller
		
		}; // end return directive provider object
	} // end function
]) // end directive


; // end module