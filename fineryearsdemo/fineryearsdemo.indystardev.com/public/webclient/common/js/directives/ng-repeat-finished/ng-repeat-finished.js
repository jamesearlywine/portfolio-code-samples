/* globals angular */

// adapted from:    http://stackoverflow.com/questions/15207788/calling-a-function-when-ng-repeat-has-finished
//                  http://jsfiddle.net/mrajcok/W8nhv/
angular.module('ngRepeatFinished', [])
	.directive('ngRepeatFinished', [
			'$timeout',
			'$rootScope',
		function (
			$timeout,
			$rootScope
		) {
			return {
				restrict: 'A',
				link: function (scope, element, attr) {
					if (scope.$last === true) {
						$timeout(function () {
							$rootScope.$broadcast(attr.ngRepeatFinished);
						});
					}
				}
			}
		}
	]) // end directive


	/*
	.directive('ngRepeatFinishedAsync', [
			'$timeout', 
		function (
			$timeout
		) {
			return {
				restrict: 'A',
				link: function (scope, element, attr) {
					if (scope.$last === true) {
						scope.$evalAsync(attr.ngRepeatFinished);
					}
				}
			}
		}
	]) // end directive
	.directive('ngRepeatFinishedEvent', [
			'$timeout',
			'$rootScope',
		function (
			$timeout,
			$rootScope
		) {
			return {
				restrict: 'A',
				link: function (scope, element, attr) {
					if (scope.$last === true) {
						$timeout(function () {
							$rootScope.$broadcast(attr.ngRepeatFinished);
						});
					}
				}
			}
		}
	]) // end directive
	*/
	
; // end module