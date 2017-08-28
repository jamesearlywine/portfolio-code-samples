/* globals angular */
window.scriptBasepath.detectFor('DirectiveTemplateDirective');
angular.module('DirectiveTemplateDirective', [
  
])
.directive('directiveTemplate', function() {
  return {
    
    restrict: 'E',
    templateUrl: window.scriptBasepath.for('DirectiveTemplateDirective') + 'directive-template.html',
    scope: {
			// selected : '=?'
		},
		transclude: false,
		controller: [
			'$scope',
			'$element',
			'$attrs',
			'$transclude',
			'$timeout',
			'$interval',
			'$sce',
			'$window',
			'DirectiveTemplateService',
		function(
			$scope, 
			$element, 
			$attrs, 
			$transclude,
			$timeout,
			$interval,
			$sce,
			$window,
			DirectiveTemplateService
		) 
		{
			// ** debug ** //
			window.appDebug.DirectiveTemplateCtrl = $scope;
			window.appDebug.DirectiveTemplateService = DirectiveTemplateService;
			
			// for loading css from directive folder
			$scope.directiveBasepath = window.scriptBasepath.for('DirectiveTemplateDirective');
			
			$scope.defaults = {
				
			};
			angular.extend($scope, 
				angular.extend({}, $scope.defaults, $scope)
			);
			$scope.DirectiveTemplateService = DirectiveTemplateService;
			
			// controller entry
			$scope.main = function() {
			
			};


			// ** kick it off..
			$scope.main();
			
		}] // end controller

  }; // end return directive provider object
}) // end directive

.factory('DirectiveTemplateService', [
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
			},
			get : function(key) {
				return this.state[key];
			},
			set : function(key, value) {
				this.state[key] = value;
				return this;
			}

		} // end return 
		
	} // end function()
]) // end service factory

; // end module