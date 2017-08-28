/* globals angular, $ */
window.scriptBasepath.detectFor('BusyAnimationDirective');

/**
 *  Directive 
 */
angular.module('BusyAnimationDirective', [
		'angularSpinner',
		'ngLodash',
		'templates'
	])
	
	.config([
	    'usSpinnerConfigProvider',
	  function(
	    usSpinnerConfigProvider
	  ) {
	    usSpinnerConfigProvider.setDefaults({
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
        className :'busy-spinner'
      });
	  }
  ])
	.directive('busyAnimation', function() {
		return {
			restrict: 'E',
			templateUrl: 'common/js/directives/busy-animation/busy-animation.html',
			scope: {
				
			},
			transclude: false,
			controller: [
				'$scope',
				'$timeout',
				'$window',
				'BusyAnimationService',
			function(
				$scope, 
				$timeout,
				$window,
				BusyAnimationService
			) 
			{
				// ** debug ** //
				window.appDebug.BusyAnimationCtrl     = $scope;
				
				// for loading css from directive folder
				$scope.directiveBasepath = window.scriptBasepath.for('BusyAnimationDirective');
				
				$scope.BusyAnimationService = BusyAnimationService;
				
				$scope.defaults = {
					spinnerKey: 'busy',
					spinnerOptions: {
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
            className :'busy-spinner'
          }
				};
				
				angular.extend($scope, 
					angular.extend({}, $scope.defaults, $scope)
				);
				
				// controller entry
				$scope.main = function() {
				
				};
				
				$scope.$on('us-spinner:spin', function(event, key) {
          // console.log('us-spinner:spin args: ', key);
          if (key.trim() == 'busy') {
              $timeout(function() {
                  BusyAnimationService.showBackdrop = true;    
              }, 0)
          }
        });
        $scope.$on('us-spinner:stop', function(event, key) {
          if (key === undefined) {return}
          if (key.trim() == 'busy') {
              $timeout(function() {
                  BusyAnimationService.showBackdrop = false; 
              }, 0);    
          }
        });
        $scope.$on('$stateChangeStart', function() {
          BusyAnimationService.showBackdrop = false;
        });
                   
				
				
				//console.log('BusyAnimationCtrl initialized');


				// ** kick it off..
				$scope.main();
				
			} // end function
		] // end controller
	}; // end return
}) // end directive(function() {})

.factory('BusyAnimationService', [
  'lodash',
  'usSpinnerService',
  function(
      lodash,
      usSpinnerService
  )
  {
	  window.usSpinnerService = usSpinnerService;
	  
	  var busyAnimationConfig = {
	      debounceDelay: 500, // in ms
	  }
  
  	return {
      
      defaultDebounceDelay    :busyAnimationConfig.debounceDelay,
      debounceDelay           :busyAnimationConfig.debounceDelay,
      shouldSpin      : false,
      spinnerService  : usSpinnerService,
      busyMessage     : null,
      showBackdrop    : false,

      // fluent setter for message to display with busy animation
      withMessage : function(text) {
          this.busyMessage = text;
          return this;
      },
      withDelay : function(delay) {
          this.debounceDelay = delay;
          return this;
      },
      _doStart        : function() {
          // console.log('BusyAnimationService._doStart() called.  this.shouldSpin: ', this.shouldSpin);
          if (this.shouldSpin === true) {
              this.spinnerService.spin('busy');
              this.shouldSpin = false;
          }
      }, 
      start : function(debounceDelay) {
          if (debounceDelay !== undefined) {
              this.withDelay(debounceDelay);
          }
          this.shouldSpin = true;
          if (this.debounceDelay > 0) {
            this._doStartDebounced = lodash.debounce(
                this._doStart.bind(this),
                this.debounceDelay,
                false
            );
            this._doStartDebounced();  
          } else {
            this._doStart();
          }
          
      },
      stop : function() {
          this.shouldSpin = false; // debounced code should not execute
          this.busyMessage = null;  // reset busy message to null
          this.debounceDelay = this.defaultDebounceDelay;
          this.spinnerService.stop('busy');
      }
      
      

    } // end return 
	        
  } // end function()
	    
]) // end service()
    
; // end angular.module()

	
	