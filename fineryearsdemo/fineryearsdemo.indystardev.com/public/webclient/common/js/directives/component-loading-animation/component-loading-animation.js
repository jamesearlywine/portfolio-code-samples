/* globals angular, $ */
window.scriptBasepath.detectFor('ComponentLoadingAnimationDirective');

/**
 *  Directive 
 */
angular.module('ComponentLoadingAnimationDirective', [
		'angularSpinner',
		'ngLodash',
		'templates'
	])

	.directive('componentLoadingAnimation', function() {
		return {
			restrict: 'E',
			templateUrl: 'common/js/directives/component-loading-animation/component-loading-animation.html',
			scope: {
				componentKey: '=?',
				busyMessage: '=?',
				spinnerOptionsDefaults: '@?',
				spinnerOptions: '@?',
				stopAnimationDelay: '@?',
				showBackdropInitialState: '@?'
			},
			transclude: false,
			controller: [
				'$scope',
				'$timeout',
				'$window',
				'usSpinnerService',
			function(
				$scope, 
				$timeout,
				$window,
				usSpinnerService
			) 
			{
				// ** debug ** //
				if (window.appDebug.ComponentLoadingAnimationCtrls === undefined) {
				  window.appDebug.ComponentLoadingAnimationCtrls = [];
				}
				window.appDebug.ComponentLoadingAnimationCtrls.push($scope);
				
				$scope.showBackdrop = $scope.showBackdropInitialState !== undefined
														? $scope.$eval($scope.showBackdropInitialState)
														: true
				;

				// for loading css from directive folder
				$scope.directiveBasepath = window.scriptBasepath.for('ComponentLoadingAnimationDirective');
				$scope.defaults = {
					componentKey: 'component-loading',
					busyMessage: '',
					spinnerOptionsDefaults: {
            lines     :13,
            length    :28,
            width     :14,
            radius    :42,
            scale     :1.00,
            corners   :1.0,
            opacity   :0.25,
            rotate    :0,
            direction :1,
            speed     :1.0,
            trail     :60,
            color     :'white',
            className :'component-loading-spinner'
          }
				};
				
				$scope.spinnerOptionsDefaults = $scope.$eval($scope.spinnerOptionsDefaults);
				$scope.spinnerOptions = $scope.$eval($scope.spinnerOptions);
				
				angular.extend($scope, 
					angular.extend({}, $scope.defaults, $scope)
				);
				
				$scope.spinnerOptions = angular.extend({}, $scope.spinnerOptionsDefaults, $scope.spinnerOptions);
				
				// controller entry
				$scope.main = function() {
				    $scope.startSpinner();
				};

        $scope.$on('$stateChangeStart', function() {
          $scope.showBackdrop = false;
        });
        
        $scope.$on('component-loaded', function(event, args) {
          if (args.key === $scope.componentKey) {
            //console.log('this component has loaded, removing loading animation');
            var delay = args.stopAnimationDelay !== undefined 
                      ? args.stopAnimationDelay
                      : $scope.stopAnimationDelay
            ;
            $timeout(function() {
              $scope.stopSpinner();  
            }, delay);
            
          }
        });
        
        $scope.startSpinner = function() 
        { 
          $timeout(function() {
            usSpinnerService.spin($scope.componentKey); 
            $scope.showMessage = true;
            $scope.showBackdrop = true;
          }, 0);
        };
        
        $scope.stopSpinner = function()
        {
          $timeout(function() {
            usSpinnerService.stop($scope.componentKey);
            $scope.showMessage = false;
            $scope.showBackdrop = false;
          }, 0);
        };
        
				// console.log('ComponentLoadingAnimationCtrl initialized');


				// ** kick it off..
				$scope.main();
				
			} // end function
		] // end controller
	}; // end return
}) // end directive(function() {})
  
; // end angular.module()

	
	