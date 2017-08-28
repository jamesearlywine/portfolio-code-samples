/* globals angular */
window.scriptBasepath.detectFor('MapInfoWindowDirective');
angular.module('MapInfoWindowDirective', [
  
])
.directive('mapInfoWindow', [
	'$window',
	function(
		$window	
	) {
		return {
		  
		  restrict: 'E',
		  templateUrl: 'common/js/directives/map-info-window/map-info-window.html',
		  scope: {
				communityId : '=?'
			},
			link: function(scope, element, attrs) {
				// debug
				/*
				if (window.appDebug.MapInfoWindowCtrls === undefined) {
					window.appDebug.MapInfoWindowCtrls = [];
				}
				if (window.appDebug.MapInfoWindowCtrls === undefined) {window.appDebug.MapInfoWindowCtrls = [];}
				window.appDebug.MapInfoWindowCtrls.push(scope);
				console.log('initializing MapInfoWindowCtrl scope: ', scope);
				*/
				
				// for loading css from directive folder
				scope.directiveBasepath = window.scriptBasepath.for('MapInfoWindowDirective');
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
				'Analytics',
				'CommunitiesService',
				'MarkersService',
				'FavoritesService',
				'AuthService',
			function(
				$scope, 
				$timeout,
				Analytics,
				CommunitiesService,
				MarkersService,
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

				// controller entry
				$scope.main = function() {
					CommunitiesService.getCommunityById($scope.communityId)
						.then(function(community) {
							$scope.community = community;
							$scope.urlFriendlyCommunityName = encodeURIComponent($scope.community.name).replace(/%20/g, '-');
							$scope.formatMarkerData();
						})
					;
				};
		
				/**
				 * Refresh/init
				 */
				$scope.$on('favorites::updated', function(event, options) {
					// console.log('map-info-window ', $scope, ' heard favorites::updated with options: ', options);
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

		
		
				$scope.closeAllInfoWindows = function()
				{
					MarkersService.closeAllInfoWindows();
				};
		
				/**
				 * Formatting
				 */
				$scope.formatMarkerData = function()
        {
        	if (!$scope.community) {return;}
          $scope.community.phone	= this.formatPhoneNumber($scope.community.phone);
          $scope.community.fax		= this.formatPhoneNumber($scope.community.fax);
        };
      
        $scope.formatPhoneNumber = function(phoneNumber) 
        {
        	if (phoneNumber.toString()[0] === '+') {return phoneNumber;}
        	
          phoneNumber = phoneNumber.replace(/^\s+/, '');
          phoneNumber = phoneNumber.replace(/^[1|0]+/, '');
          
          var strPhoneNumber = phoneNumber.toString();
          if (strPhoneNumber.length !== 10) {return strPhoneNumber;}
          var parsedPhoneNumber = 
                                  '('
                                + strPhoneNumber[0] 
                                + strPhoneNumber[1] 
                                + strPhoneNumber[2] 
                                + ') '
                                + strPhoneNumber[3] 
                                + strPhoneNumber[4] 
                                + strPhoneNumber[5] 
                                + '-'
                                + strPhoneNumber[6] 
                                + strPhoneNumber[7] 
                                + strPhoneNumber[8] 
                                + strPhoneNumber[9] 
          ;
          
          return parsedPhoneNumber;
        }

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

		
				// ** kick it off..
				$scope.main();
				
			}] // end controller
		
		}; // end return directive provider object
	} // end function
]) // end directive

; // end module