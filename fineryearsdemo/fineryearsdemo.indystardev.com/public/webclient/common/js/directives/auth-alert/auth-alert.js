/* globals angular, $ */
window.scriptBasepath.detectFor('AuthAlertDirective');
/**
 *  Directive 
 */
angular.module('AuthAlertDirective', [
		
	])
	.directive('authAlert', function() {
		return {
			restrict: 'E',
			templateUrl: 'common/js/directives/auth-alert/auth-alert.html',
			scope: {
				
			},
			transclude: false,
			controller: [
				'$scope',
				'$timeout',
				'$window',
				'AppConfig',
			function(
				$scope, 
				$timeout,
				$window,
				AppConfig
			) 
			{
				// ** debug ** //
				window.appDebug.AuthAlertCtrl     = $scope;
				
				// for loading css from directive folder
				$scope.directiveBasepath = window.scriptBasepath.for('AuthAlertDirective');
				
				$scope.defaults = {
				  messageDuration : 3000,
				  message					: null,
				  visible					: false,
				  busy						: false
				};
				
				angular.extend($scope, 
					angular.extend({}, $scope.defaults, $scope)
				);
				
				// controller entry
				$scope.main = function() {
				
				};

				$scope.showMessage = function(options) 
				{ 
					$scope.busy = true;
				  options = options || {};
				  options = angular.extend({}, $scope.defaults, options);
				  $timeout(function() {
				  	$scope.visible = true;
				    $scope.message = this.options.message;
				  }.bind({options: options}), 0);
				  if (options.messageDuration > 0) {
					  $timeout(function() {
					  	$scope.close();
					  }, options.messageDuration);	
				  }
				};
				$scope.close = function()
				{
					// console.log('removing alert message');
			  	$scope.visible		= false;
			  	$timeout(function() {
			  		$scope.message	= null;
			  		$scope.busy			= false;
			  	}, 250)
				}

				$scope.authMessages = {
				  'loggedIn'  : 'You are now logged in.',
				  'loggedOut' : 'You have been logged out.'
				};
				$scope.$on('authalert::loggedIn', function(event, args) {
				  if ($scope.busy) {return;}
				  args = args || {};
					args.messageDuration	= args.messageDuration !== undefined
				  											? args.messageDuration
				  											: $scope.defaults.messageDuration
					;
				  $scope.showMessage({message: $scope.authMessages.loggedIn, messageDuration: args.messageDuration})
        });
        $scope.$on('authalert::loggedOut', function(event, args) {
	        if ($scope.busy) {return;}
	        args = args || {};
	        args.messageDuration	= args.messageDuration !== undefined
				  											? args.messageDuration
				  											: $scope.defaults.messageDuration
					;
					$scope.showMessage({message: $scope.authMessages.loggedOut, messageDuration: args.messageDuration})
        });
        $scope.$on('authalert::message', function(event, args) {
          if ($scope.busy) {return;}
          args = args || {};
          args.messageDuration	= args.messageDuration !== undefined
				  											? args.messageDuration
				  											: $scope.defaults.messageDuration
					;
					$scope.showMessage({message: args.message, messageDuration: args.messageDuration});
        });
    
				
				
				//console.log('BusyAnimationCtrl initialized');


				// ** kick it off..
				$scope.main();
				
			} // end function
		] // end controller
	}; // end return
}) // end directive(function() {})
  
; // end angular.module()

	
	