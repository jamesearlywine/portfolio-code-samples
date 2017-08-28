/* globals angular */
window.scriptBasepath.detectFor('TableListCommunityDirective');
angular.module('TableListCommunityDirective', [
  
])
.directive('tableListCommunity', [
	'$window',
	function(
		$window	
	) {
		return {
		  
		  restrict: 'A',
		  templateUrl: 'common/js/directives/table-list-community/table-list-community.html',
		  scope: {
				community : '='
			},
			link: function(scope, element, attrs) {
				// debug
				/*
				if (window.appDebug.TableListCommunityCtrls === undefined) {
					window.appDebug.TableListCommunityCtrls = [];
				}
				console.log('initializing TableListCommunityCtrl scope: ', scope);
				*/
				if (window.appDebug.TableListCommunityCtrls === undefined) {$window.appDebug.TableListCommunityCtrls = [];}
				window.appDebug.TableListCommunityCtrls.push(scope);
				
				// for loading css from directive folder
				scope.directiveBasepath = $window.scriptBasepath.for('TableListCommunityDirective');
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
				'$timeout',
				'$window',
				'$state',
				'Analytics',
				'CommunitiesService',
				'FavoritesService',
				'AuthService',
			function(
				$scope, 
				$timeout,
				$window,
				$state,
				Analytics,
				CommunitiesService,
				FavoritesService,
				AuthService
			) 
			{
				
				/**
				 * Initialize Scope
				 */
				 $scope.defaults = {
					
				};
				angular.extend( $scope, angular.extend({}, $scope.defaults, $scope) );
				$scope.urlFriendlyCommunityName = encodeURIComponent($scope.community.name).replace(/%20/g, '-');
				
				$scope.$state = $state;
				
				// controller entry
				$scope.main = function() {
					$scope.buildCategoryGrid();
				};

				/**
				 * Refresh/init
				 */
				$scope.$on('favorites::updated', function(event, options) {
					// console.log('table-list-community', $scope, ' heard favorites::updated with options: ', options);
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

				$scope.categoriesById   = {};
				$scope.buildCategoryGrid = function() {
					for (var key in $scope.community.category_memberships) {
						var categoryMembership = $scope.community.category_memberships[key];
						$scope.categoriesById[categoryMembership.category.id] = true;
					}
				};
				
				/**
				 * Community Region(s) Click Handler (when $state.current.name === 'saved')
				 */
				$scope.goToSavedMap = function(community)
				{
					$scope.$root.$broadcast('tableListCommunity::communityRegionClicked', {community: community});
				};
		
				// ** kick it off..
				$scope.main();
				
			}] // end controller
		
		}; // end return directive provider object
	} // end function
]) // end directive


; // end module