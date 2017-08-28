/* globals angular */

/**
 * dependencies injected
 */
angular.module('app.community', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('community', {
      url: '/community',
      templateUrl: 'app/community/community.html',
      controller: ['$state', function($state) {
        $state.go('communities', {}, {});
      }],
      resolve: {
        
      },
      reload: true
    })
    .state('communityById', {
      url: '/community/:id',
      templateUrl: 'app/community/community.html',
      controller: 'CommunityCtrl',
      resolve: {
        
      },
      reload: true
    })
    .state('communityByIdWithName', {
      url: '/community/:id/:name',
      templateUrl: 'app/community/community.html',
      controller: 'CommunityCtrl',
      resolve: {
        
      },
      reload: true
    })
  ; // end $stateProvider.state()
  
}])

/**
 * Controller
 */
// controllers definition 
.controller('CommunityCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'OmnitureService',
    'CommunitiesService',
    'AuthService',
    'FavoritesService',
    'EmailService',
    'MarkersService',
    'Analytics',
    'ngMeta',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    OmnitureService,
    CommunitiesService,
    AuthService,
    FavoritesService,
    EmailService,
    MarkersService,
    Analytics,
    ngMeta
    
) {
  
    /* debug */
    window.appDebug.CommunityCtrl   = $scope;
    
    /**
     * Scope initialization
     */
    $scope.communityId              = $state.params.id;
    if ($scope.communityId === undefined) {return false;}

    /* community controller entry */
    $scope.firstLoad = true;
    $scope.main = function() {

      /**
       * Data
       */
      CommunitiesService.getCommunityById($scope.communityId)
        .then(function(community) {
          $scope.community = community;
          $scope.setMetadata();
          MarkersService.ungrowMarkerByCommunityId($scope.community.id);
          $scope.mapCommunities = [community];
          if ($scope.firstLoad && $scope.community.gallery !== null) {
            $scope.communityGalleryImages = $scope.community.gallery.images.slice(0);
            $scope.firstLoad = false;
          }
          // redirection
          if ( $scope.community === undefined 
           || !$scope.community.isEnhanced
          ) 
          {
            $state.go('home', {}, {});
          }
          
        })
      ;
      
    };
    
    /**
     * Metadata (SEO)
     */
    $scope.setMetadata = function() {
      ngMeta.setTitle($scope.community.name);
      $scope.metaDescription = ($scope.community.enhanced_intro_text !== null 
                            &&  $scope.community.enhanced_intro_text.trim() !== '')
                            ? $scope.community.enhanced_intro_text.substr(0,199) + '..'
                            : AppConfig.Metadata.defaultDescription
      ;
      ngMeta.setTag('description', $scope.metaDescription);
    };    
    
    /**
     * Google Maps
     */
    // keep track of whether google maps has loaded into the global space
    $scope.googleMapsLoaded = false;
    window.getGlobalGoogleMaps.then(function() {
      $timeout(function() {
        this.googleMapsLoaded = true;  
      }.bind(this), 0);
    }.bind($scope));    

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
		$scope.$on('favorites::updated', function(event, options) {
			// console.log('CommunityCtrl ', $scope, ' heard favorites::updated with options: ', options);
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
		 * Email - request more information
		 */
    $scope.EmailService = EmailService;
    $scope.informationRequestDefaults = {
      name: null,
      email: null,
      phone: null,
        phone1: null,
        phone2: null,
        phone3: null,
      message: null
    };
    $scope.informationRequest = {};
    $scope.initInformationRequest = function() {
      $timeout(function() {
        angular.extend($scope.informationRequest, $scope.informationRequestDefaults);
      }, 0);
    };
    $scope.initInformationRequest();
    $scope.submissionAttempted = false;
    $scope.theForm = null;
    $scope.submitting = false;
    $scope.submitRequest = function(theForm)
    {
      $scope.submissionAttempted = true;
      $scope.theForm = theForm;
      if (!theForm.$valid) {
        // console.log('the form is invalid, not submitting');
        // move focus to the first invalid form element
        angular.element('input.ng-invalid, textarea.ng-invalid').first().focus();
        return;
      }
      
      // adjust phone number
      $scope.getTransformedInformationRequest();
      // submit information request
      $scope.submitting       = true;
      $scope.submitComplete   = false;
      
      EmailService.sendEmail_communityRequestMoreInformation(
        $scope.transformedInformationRequest
      )
        .then(function(response) {
          $scope.submitting       = false;
          $scope.submitComplete   = true;
          $scope.submitSucceeded  = true;
          $scope.resetFormValidation();
          $scope.initInformationRequest();
          // console.log('message request success, response: ', response);
        }, function(response) {
          $scope.submitting       = false;
          $scope.submitComplete   = true;
          $scope.submitSucceeded  = false;
          // console.log('message request failure, response: ', response);
        })
      ;
    };
    $scope.resetFormValidation = function()
    {
      $scope.submissionAttempted = false;
      $scope.theForm.$setPristine();
      $scope.theForm.$setUntouched();
    };
    $scope.getTransformedInformationRequest = function()
      
    {
      $scope.transformedInformationRequest = angular.extend({}, $scope.informationRequest);
      if (
          $scope.informationRequest.phone1 !== null
       && $scope.informationRequest.phone2 !== null
       && $scope.informationRequest.phone3 !== null
      ) {
        $scope.transformedInformationRequest.phone = 
            '(' + $scope.informationRequest.phone1 + ')' 
          + ' ' + $scope.informationRequest.phone2 
          + '-' + $scope.informationRequest.phone3
        ;
      } else {
        delete($scope.transformedInformationRequest.phone)
      }
      delete($scope.transformedInformationRequest.phone1);
      delete($scope.transformedInformationRequest.phone2);
      delete($scope.transformedInformationRequest.phone3);
      
      $scope.transformedInformationRequest.communityId = $scope.communityId;
      
      return $scope.transformedInformationRequest;
    };
		
		// Phone number auto-tab to next form element
    $scope.$watch('informationRequest.phone1', function(newValue, oldValue) {
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#phone2').focus();}
    });
    $scope.$watch('informationRequest.phone2', function(newValue, oldValue) {
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#phone3').focus();}
    });
		
		/**
		 * Record ad-click
		 */
		$scope.recordAdClick = function()
		{
		  var name = encodeURIComponent($scope.community.name).replace(/%20/g, '-');
		  var communityIdentifier = ''
		      + $scope.community.id
		      + '_'
		      + name
      ;
      // console.log('recording event \'ad-click\', communityIdentifier: ' + communityIdentifier);
      Analytics.trackEvent('ad-click', communityIdentifier);
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
		
    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-community'
    };
    $scope.omnitureDelay = 1000; // ms
    $scope.reportToOmniture = function() {
      // console.log('reporting to omniture: ', $scope.omniture);
      $timeout(function() {
        OmnitureService
          .set('section',     $scope.omniture.section)
          .set('extension',   $scope.omniture.extension)
          .report()
        ;                    
      }, $scope.omnitureDelay);
    };

    

    
    /* kick it off */
    $scope.main();
      
  } // end function
]) // end controller

;