/* globals angular */
window.scriptBasepath.detectFor('SiteFooterDirective');
angular.module('SiteFooterDirective', [
  
])
.directive('siteFooter', function() {
  return {
    
    restrict: 'E',
    templateUrl: 'common/js/directives/site-footer/site-footer.html',
    scope: {
			// selected : '=?'
		},
		transclude: false,
		controller: [
			'$scope',
			'$state',
			'AuthService',
		function(
			$scope, 
			$state,
			AuthService
		) 
		{
			// ** debug ** //
			window.appDebug.SiteFooterCtrl = $scope;
			
			// for loading css from directive folder
			$scope.directiveBasepath = window.scriptBasepath.for('SiteFooterDirective');
			
			/**
			 * Scope Initialization
			 */
			$scope.defaults = {
				
			};
			angular.extend($scope, 
				angular.extend({}, $scope.defaults, $scope)
			);

			
			// controller entry
			$scope.main = function() {
			
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

		
			// ** kick it off..
			$scope.main();
			
		}] // end controller

  }; // end return directive provider object
}) // end directive


; // end module