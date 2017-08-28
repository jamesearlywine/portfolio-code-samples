/* globals angular */
window.scriptBasepath.detectFor('RoutableAdvertiseEnhanced');

/**
 * dependencies injected
 */
angular.module('app.enhanced', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('enhanced', {
      url: '/enhanced?key',
      templateUrl: window.scriptBasepath.for('RoutableAdvertiseEnhanced') + 'enhanced.html', // relative to document root
      controller: 'EnhancedCtrl',
      resolve: {
        communityCategories : ['CommunityCategoriesService', function(CommunityCategoriesService) {
          return CommunityCategoriesService.getCommunityCategories();
        }],
        regions: ['RegionsService', function(RegionsService) {
          return RegionsService.getRegions();
        }],
        amenities: ['AmenitiesService', function(AmenitiesService) {
          return AmenitiesService.getAmenities();
        }],
        community: ['CommunitiesService', '$q', '$stateParams', function(CommunitiesService, $q, $stateParams) {
          if ($stateParams.key === undefined) { return $q.when(undefined); }
          return CommunitiesService.getCommunityByEnhancedUpdateApiKey($stateParams.key);
        }]
      },
      reload: true
    })
  ; // end $stateProvider.state()
  
}])

/**
 * Controller
 */
// controllers definition 
.controller('EnhancedCtrl', [
    '$window',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'AppConfig',
    'BrowserDetectionService',
    'OmnitureService',
    'AdvertiseService',
    'BusyAnimationService',
    'CommunitiesService',
    'communityCategories', 
    'regions',
    'amenities',
    'community',
  function(   
    $window,
    $scope,
    $state,
    $stateParams,
    $timeout,
    AppConfig,
    BrowserDetectionService,
    OmnitureService,
    AdvertiseService,
    BusyAnimationService,
    CommunitiesService,
    communityCategories,
    regions,
    amenities,
    community
) {
  
    /* debug */
    window.appDebug.EnhancedCtrl         = $scope;


    /**
     * Scope Initialization
     */
    $scope.communityCategories  = communityCategories;
    $scope.regions              = regions;
    $scope.community            = community;
    $scope.amenities            = amenities;
    $scope.enhanced_update_api_key = $stateParams.key;
    
    /**
     * Redirection
     */
    //if ($state.params.key === undefined) {$state.go('signup');}
    if ($scope.community === undefined) {return $state.go('signup');}
    
    
    /* enhanced controller entry */
    $scope.main = function() {
      $scope.importCommunityToFormData();
    };
  
    
    /**
     * Form Data
     */
    $scope.formData = {
      name: null,
      address1: null,
      address2: null,
      city: null,
      state: 'Indiana',
      zip: null,
      phone_part1: null,
      phone_part2: null,
      phone_part3: null,
      email: null,
      website: null,
      regions: {},
      communityCategories: {},
      image: null,
      facility_manager: null,
      facility_manager_phone_part1: null,
      facility_manager_phone_part2: null,
      facility_manager_phone_part3: null,
      facility_manager_email: null,
      submitter_name: null,
      submitter_phone_part1: null,
      submitter_phone_part2: null,
      submitter_phone_part3: null,
      submitter_email: null,
      galleryImages: []
    };
    
    /**
     * Community to Form Data map
     * @note  formData field <- community field
     */
    $scope.communityToFormDataMap = {
      // programtically iterate over these fields mapping 1:1 to each other
      simpleFields: {
        'id'                      : 'id',
        'name'                    : 'name',
        'address1'                : 'address1',
        'address2'                : 'address2',
        'city'                    : 'city',
        'state'                   : 'state',
        'zip'                     : 'zip',
        'website'                 : 'website',
        'email'                   : 'email',
        'submitter_name'          : 'submitter_name',
        'submitter_email'         : 'submitter_email',
        'facility_manager'        : 'facility_manager',
        'facility_manager_email'  : 'facility_manager_email',
        'enhanced_intro_text'     : 'enhanced_intro_text'
      },
      
      
      // informational only - not used programatically, just notes on schema mapping
      
      // simple concatenation & disaggregation functions for these fields
      packagedFields: {
        'facility_manager_phone_part1'  : 'facility_manager_phone',
        'facility_manager_phone_part2'  : 'facility_manager_phone',
        'facility_manager_phone_part3'  : 'facility_manager_phone',
        'submitter_phone_part1'         : 'submitter_phone',
        'submitter_phone_part2'         : 'submitter_phone',
        'submitter_phone_part3'         : 'submitter_phone',
        'phone_part1'                   : 'phone',
        'phone_part2'                   : 'phone',
        'phone_part3'                   : 'phone',
      },
      image: {
        'image'                 : 's3_image_url' // simply use the url
      },
      galley: {
        'galleryImages'         : 'gallery' // iterate and build galleryImages from community.gallery object
      },
      regions: { // bounded enumeration comes from Regions service
        'regions'               : 'regions' // map 1:1 from csv to array
      },
      careTypes: { // bounded enumeration comes from Categories services
        'communityCategories'   : 'category_memberships' // build communityCategories data, including description, etc
      },
      amenities: { // unbounded enumeration, type-ahead comes from Amenities service
        'amenities'             : 'amenities' // values mapped 1:1 from csv to array
      }
      
    };

    $scope.importCommunityToFormData = function()
    {
      // import simple texts 1:1 from map defined above
                // angular.extend($scope.formData, $scope.community);
      for (var formDataField in $scope.communityToFormDataMap.simpleFields) {
        var communityField = $scope.communityToFormDataMap.simpleFields[formDataField];
        if ($scope.community[communityField] !== undefined) {
          $scope.formData[formDataField] = $scope.community[communityField];
        }
      }
      
      // image field
      if ($scope.community.image_url !== null) {
        $scope.formData.image = {
          s3_image_url: $scope.community.s3_image_url,
          image_url: $scope.community.image_url
        };
      }
      
      // gallery images
      $scope.initGalleryImages();
      
      // concatenated fields - disaggregation 
      $scope.formData.phone_part1                   = $scope.community.phone.substring(0, 3);
      $scope.formData.phone_part2                   = $scope.community.phone.substring(3, 6);
      $scope.formData.phone_part3                   = $scope.community.phone.substring(6);
      $scope.formData.facility_manager_phone_part1  = $scope.community.facility_manager_phone.substring(0, 3);
      $scope.formData.facility_manager_phone_part2  = $scope.community.facility_manager_phone.substring(3, 6);
      $scope.formData.facility_manager_phone_part3  = $scope.community.facility_manager_phone.substring(6);
      $scope.formData.submitter_phone_part1         = $scope.community.submitter_phone.substring(0, 3);
      $scope.formData.submitter_phone_part2         = $scope.community.submitter_phone.substring(3, 6);
      $scope.formData.submitter_phone_part3         = $scope.community.submitter_phone.substring(6);
      
      // regions
      $scope.initRegions();
      for (var key in $scope.community.regions) {
        var region = $scope.community.regions[key];
        $scope.selectRegionById(region.id);
      }
      
      // community categories
      $scope.initCommunityCategories();
      $timeout(function() {
        for (var key in $scope.community.category_memberships) {
          var categoryMembership = $scope.community.category_memberships[key];
          $scope.selectCategoryByMembership(categoryMembership);
        }
      }, 200);
      
      // amenities
      $scope.formData.amenities = $scope.community.amenities.slice(0);
      
    };
    
    $scope.selectRegionById = function(regionId)
    {
      for (var key in $scope.formData.regions) {
        var region = $scope.formData.regions[key];
        if (region.id == regionId) {
          region.selected = true;
        }
      }
    };
    
    $scope.selectCategoryByMembership = function(categoryMembership)
    {
      for (var key in $scope.formData.communityCategories) {
        var category = $scope.formData.communityCategories[key];
        if (categoryMembership.category.id.toString() == category.id ) {
          $scope.formData.communityCategories[key].selected = true;
          if (categoryMembership.description !== undefined) {
            category.description = categoryMembership.description;
          }
        }
      }
    };
    
    $scope.initCommunityCategories = function() 
    {
      for (var key in $scope.communityCategories) {
        var item = $scope.communityCategories[key];
        item.selected = false;
        $scope.formData.communityCategories[item.id] = item;
      }
    };
    $scope.initRegions = function() 
    {
      for (var key in $scope.regions) {
        var item = $scope.regions[key];
        item.selected = false;
        $scope.formData.regions[item.id] = item;
      }
    };
    $scope.states = [
      'Indiana'
    ];
    
    // all category selection
    $scope.selectAllCategories = false;
    $scope.$watch('selectAllCategories', function(newValue, oldValue) {
      $timeout(function() {
        for (var key in $scope.formData.communityCategories) {
          var item = $scope.formData.communityCategories[key];
          item.selected = newValue;
        }
      });
    });


    /**
     * Amenities
     */
    $scope.openSelectAmenityDropdown = function() { 
      $timeout(function() {
        $scope.selectedAmenity = ''; 
        $scope.updateAmenitiesWithSelected();
      }, 0)
      .then(function() {
        angular.element('#select-amenity').blur();  
      })
      ;
    };
    $scope.closeSelectAmenityDropdown = function() { 
      $timeout(function() {
        $scope.selectedAmenity = null;
        angular.element('#select-amenity').blur();  
      }, 0)
      .then(function() {
          $scope.selectedAmenity = '';
      });
    };
    $scope.clearSelectedAmenity = function() {
      return $timeout(function() {
        $scope.selectedAmenity = '';
        angular.element('#select-amenity').blur();  
      }, 0);
    };
    $scope.removeAmenity = function(amenity) {
      var theAmenity  = (amenity !== null && typeof amenity === 'object')
                      ? amenity
                      : {id: null, name: amenity}
      ;
      $timeout(function() {
        for (var key in $scope.formData.amenities) {
          if ($scope.formData.amenities[key].name === theAmenity.name) {
            $scope.formData.amenities.splice(key, 1);
          }
        }
        $scope.updateAmenitiesWithSelected();  
      }, 0);
    }
    $scope.selectAmenity = function($item, $model, $label, $event)
    {
      
      if ($scope.selectedAmenity === undefined 
       || $scope.selectedAmenity === null 
       || ($scope.selectedAmenity.trim && $scope.selectedAmenity.trim() === '')
      ) {
        
        $scope.openSelectAmenityDropdown();
        return;
      }

      if (!$scope.amenitySelected($scope.selectedAmenity)) {
        $timeout(function() {
          var selectedAmenity = ($scope.selectedAmenity !== null && typeof $scope.selectedAmenity === 'object')
                              ? $scope.selectedAmenity
                              : {id: null, name: $scope.selectedAmenity}
          ;
          $scope.formData.amenities.push(selectedAmenity);
          
          if (BrowserDetectionService.isMobile) {
            // for mobile
            $scope.closeSelectAmenityDropdown();
          } else {
            // for desktop
            $scope.clearSelectedAmenity()
              .then(function() {
                //$scope.openSelectAmenityDropdown();
              })
            ;
          }
          
          $scope.updateAmenitiesWithSelected();
        }, 0);
      } else {
        $scope.clearSelectedAmenity()
          .then(function() {
            // $scope.openSelectAmenityDropdown();
          })
        ;
        $scope.updateAmenitiesWithSelected();
      }
    };
    $scope.amenitySelected = function(amenity)
    {
      var theAmenity  = (amenity !== null && typeof amenity === 'object')
                      ? amenity
                      : {id: null, name: amenity}
      ;
      var selected = false;
      for (var key in $scope.formData.amenities) {
        var existingAmenity = $scope.formData.amenities[key];
        if (existingAmenity.name === theAmenity.name) {
          selected = true;
        }
      }
      return selected;
    };
    $scope.updateAmenitiesWithSelected = function()
    {
      $timeout(function() {
        for (var key in $scope.amenities) {
          $scope.amenities[key].selected = $scope.amenitySelected($scope.amenities[key]);
        }  
      }, 0);
    };
    $scope.updateAmenitiesWithSelected();

    
    /**
     * Image Management
     */
    $scope.removePhoto = function()
    {
      $timeout(function() {
        $scope.formData.image = null;  
      });
    };

    /**
     * Form Submission
     */
    $scope.submitted = false;
    $scope.submitForm = function(isValid)
    {
      //console.log('submitForm isValid: ', isValid);
      
      // form submit has been attempted at least once (irrespective of validation outcome)
      $scope.submitted = true;
      
      $scope.validatePhoneNumber();
      $scope.submitterValidatePhoneNumber();
      $scope.managerValidatePhoneNumber();
      $scope.validateImage();
      $scope.validateCategorySelected();
      
      /* dummy validation pass
        isValid = true;
        $scope.categorySelected = true;
        $scope.imageValid = true;
      */
      
      // if the form passes validation, 
      if (isValid) {
          //console.log('passes built-in validation');
          
          if (!$scope.categorySelected) {
            //console.log('no categpry is selected though..');
            // scroll to the first invalid element
            angular.element('html, body')
              .animate(
                {
                  scrollTop: angular.element('#community-category-form-field').first().offset().top - 40 // scroll some pixels above the form element
                }, 
                500, // animation duration (ms)
                function(){ // then..
                  // focus that element for input
                  angular.element('input.ng-invalid').first().focus();
                }
              )
            ;
          } else if (!$scope.imageValid) {
            // console.log('image is invalid though..');
            // scroll to the first invalid element
            angular.element('html, body')
              .animate(
                {
                  scrollTop: angular.element('#community-image-form-element').first().offset().top - 40 // scroll some pixels above the form element
                }, 
                500, // animation duration (ms)
                function(){ // then..
                  // focus that element for input
                  angular.element('input.ng-invalid').first().focus();
                }
              )
            ;
          } else {
            // send the data
            $scope.sendData()  
          }

      } else { // otherwise
      
        // scroll to the first invalid element
        var offset = angular.element('input.ng-invalid, textarea.ng-invalid').first().offset();
        if (offset !== undefined) {
          angular.element('html, body')
            .animate(
              {
                scrollTop: offset.top - 40 // scroll some pixels above the form element
              }, 
              500, // animation duration (ms)
              function(){ // then..
                // focus that element for input
                angular.element('input.ng-invalid').first().focus();
              }
            )
          ;  
        } // end if

      }
    };
    $scope.sendDataError = null;
    $scope.sendData = function()
    {
      sendDataErrors = [];
      BusyAnimationService.start();
      $scope.buildFormSubmitData();
      AdvertiseService.enhanced.update($scope.formSubmitData)
        .then(
          function(response) {
            BusyAnimationService.stop();
            if (response.status < 400) {
              $scope.confirmSendDataSuccess();
            } else {
              $scope.indicateSendDataFailure();
            }
            
          }
        )
      ;  
    };
    
    $scope.confirmSendDataSuccess = function() 
    {
      // console.log('confirmSendDataSuccess()');
      $scope.sendComplete = true;
      $state.go('enhanced-update-confirmation', {}, {});
    };
    $scope.indicateSendDataFailure = function()
    {
      // console.log('indicateSendDataFailure()');
      $scope.sendComplete = true;
      $scope.response = AdvertiseService.enhanced.get('lastResponse');
      $scope.sendDataErrors = [];
      if ($scope.response.data.error !== undefined) {
        $scope.sendDataErrors = $scope.sendDataErrors.concat([$scope.response.data.error]);
      } 
      if ($scope.response.data.errors !== undefined) {
        $scope.sendDataErrors = $scope.sendDataErrors.concat($scope.response.data.errors);
      } 
      if ($scope.response.data.validationErrors !== undefined) {
        $scope.sendDataErrors = $scope.sendDataErrors.concat($scope.response.data.validationErrors);
      }
      if ($scope.sendDataErrors.length > 0
       && $scope.response.data.request !== undefined
      ) {
        $scope.sendDataErrorsRequest = $scope.response.data.request;
      }
      
      $scope.geocodeIssue = JSON.stringify($scope.sendDataErrors).indexOf('geocode') !== -1;

    };

    $scope.formSubmitData = {};
    $scope.buildFormSubmitData = function()
    {
      // get the formData
      $scope.formSubmitData = angular.extend({}, $scope.formData);
      $scope.formSubmitData.image_url = $scope.community.image_url;
      
      // adjust the formData..
      
      // community categories (bounded -> translates to json)
      $scope.formSubmitData.communityCategories = [];
      for (var key in $scope.formData.communityCategories) {
        var item = $scope.formData.communityCategories[key];
        if (item.selected) {
          $scope.formSubmitData.communityCategories.push({
            'id'          : item.id,
            'description' : item.description
          });
        }
      }
      // regions (bounded -> translates to csv)
      $scope.formSubmitData.regions = [];
      for (var key in $scope.formData.regions) {
        var item = $scope.formData.regions[key];
        if (item.selected) {$scope.formSubmitData.regions.push(item.id);}
      }
      
      // concatenated form fields (phone numbers)
      $scope.formSubmitData.phone = 
          $scope.formSubmitData.phone_part1
        + $scope.formSubmitData.phone_part2
        + $scope.formSubmitData.phone_part3
      ;
      delete($scope.formSubmitData.phone_part1);
      delete($scope.formSubmitData.phone_part2);
      delete($scope.formSubmitData.phone_part3);
      
      $scope.formSubmitData.submitter_phone = 
          $scope.formSubmitData.submitter_phone_part1
        + $scope.formSubmitData.submitter_phone_part2
        + $scope.formSubmitData.submitter_phone_part3
      ;
      delete($scope.formSubmitData.submitter_phone_part1);
      delete($scope.formSubmitData.submitter_phone_part2);
      delete($scope.formSubmitData.submitter_phone_part3);
      
      $scope.formSubmitData.facility_manager_phone = 
          $scope.formSubmitData.facility_manager_phone_part1
        + $scope.formSubmitData.facility_manager_phone_part2
        + $scope.formSubmitData.facility_manager_phone_part3
      ;
      delete($scope.formSubmitData.facility_manager_phone_part1);
      delete($scope.formSubmitData.facility_manager_phone_part2);
      delete($scope.formSubmitData.facility_manager_phone_part3);
      
      // enhanced update api key
      $scope.formSubmitData.enhanced_update_api_key = $scope.enhanced_update_api_key;

      
      // console.log('formSubmitData: ', $scope.formSubmitData);

    };
    
    /**
     * Form Validation
     */
    $scope.categorySelected = false;
    $scope.delayedValidateCategorySelected = function(delay)
    {
      if (delay === undefined) {delay = 0;}
      $timeout(function() {
        $scope.validateCategorySelected();
      }, delay)
    };
    $scope.validateCategorySelected = function() 
    {
      // no longer required, always show as category selected
      $scope.categorySelected = true;
      return
      
      // console.log('someCategorySelected()');
      for (var key in $scope.formData.communityCategories) {
        if ($scope.formData.communityCategories[key].selected) { 
          $scope.categorySelected = true;
          return;
        }
      }
      $scope.categorySelected = false;  
    };
    $scope.$watch('categorySelected', function(newValue, oldValue) {
      if (newValue === false) {
        $scope.selectAllCategories = false;
      }
    });
    $scope.someRegionSelected = function() 
    {
      for (var key in $scope.formData.regions) {
        if ($scope.formData.regions[key].selected) { return true; }
      }
      return false;
    };
    
    /**
     * Phone Number Validation (kind of tricky, three-part)
     */
    $scope.phoneNumberLength = function(length)
    {
      if (
          $scope.formData.phone_part1 === undefined
       || $scope.formData.phone_part2 === undefined
       || $scope.formData.phone_part3 === undefined
       
       || $scope.formData.phone_part1 === null
       || $scope.formData.phone_part2 === null
       || $scope.formData.phone_part3 === null
       
      ) {
        return false;
      }
      
      var phone =   $scope.formData.phone_part1
                  + $scope.formData.phone_part2
                  + $scope.formData.phone_part3
      ;
      
      return phone.length >= length;
    };
    $scope.phoneNumberValid = false;
    $scope.validatePhoneNumber = function()
    {
      $timeout(function() {
        $scope.phoneNumberValid = $scope.phoneNumberLength(10);
      });
    };
    $scope.$watch('formData.phone_part1', $scope.validatePhoneNumber);
    $scope.$watch('formData.phone_part2', $scope.validatePhoneNumber);
    $scope.$watch('formData.phone_part3', $scope.validatePhoneNumber);
    
    
    /**
     * Submitter Phone Number Validation (kind of tricky, three-part)
     */
    $scope.submitterPhoneNumberLength = function(length)
    {
      if (
          $scope.formData.submitter_phone_part1 === undefined
       || $scope.formData.submitter_phone_part2 === undefined
       || $scope.formData.submitter_phone_part3 === undefined
       
       || $scope.formData.submitter_phone_part1 === null
       || $scope.formData.submitter_phone_part2 === null
       || $scope.formData.submitter_phone_part3 === null
       
      ) {
        return false;
      }
      
      var phone =   $scope.formData.submitter_phone_part1
                  + $scope.formData.submitter_phone_part2
                  + $scope.formData.submitter_phone_part3
      ;
      
      return phone.length >= length;
    };
    $scope.submmitterPhoneNumberValid = false;
    $scope.submitterValidatePhoneNumber = function()
    {
      $timeout(function() {
        $scope.submitterPhoneNumberValid = $scope.submitterPhoneNumberLength(10);
      });
    };
    $scope.$watch('formData.submitter_phone_part1', $scope.submitterValidatePhoneNumber);
    $scope.$watch('formData.submitter_phone_part2', $scope.submitterValidatePhoneNumber);
    $scope.$watch('formData.submitter_phone_part3', $scope.submitterValidatePhoneNumber);

    /**
     * Facility Manager Phone Number Validation (kind of tricky, three-part)
     */
    $scope.managerPhoneNumberLength = function(length)
    {
      if (
          $scope.formData.manager_phone_part1 === undefined
       || $scope.formData.manager_phone_part2 === undefined
       || $scope.formData.manager_phone_part3 === undefined
       
       || $scope.formData.manager_phone_part1 === null
       || $scope.formData.manager_phone_part2 === null
       || $scope.formData.manager_phone_part3 === null
       
      ) {
        return false;
      }
      
      var phone =   $scope.formData.manager_phone_part1
                  + $scope.formData.manager_phone_part2
                  + $scope.formData.manager_phone_part3
      ;
      
      return phone.length >= length;
    };
    $scope.managerPhoneNumberValid = true;
    $scope.managerValidatePhoneNumber = function()
    {
      $timeout(function() {
        // $scope.managerPhoneNumberValid = $scope.managerPhoneNumberLength(10);
        $scope.managerPhoneNumberValid = true;
      });
    };
    $scope.$watch('formData.manager_phone_part1', $scope.managerValidatePhoneNumber);
    $scope.$watch('formData.manager_phone_part2', $scope.managerValidatePhoneNumber);
    $scope.$watch('formData.manager_phone_part3', $scope.managerValidatePhoneNumber);

    
    /**
     * Image Form Data Validation
     */
    $scope.imageValid = true;
    $scope.validateImage = function()
    {
      // $scope.imageValid = $scope.formData.image !== null;
      return true; // always valid, disabling required
    };
    $scope.$watch('formData.image', function(newValue, oldValue) {
      $scope.validateImage();
    });
    
    /**
     * Phone number auto-tab to next form elements
     */
    $scope.$watch('formData.phone_part1', function(newValue, oldValue) {
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#phone1').focus();}
    });
    $scope.$watch('formData.phone_part2', function(newValue, oldValue) {
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#phone2').focus();}
    });
    /**
     * Manager Phone number auto-tab to next form elements
     */
    $scope.$watch('formData.facility_manager_phone_part1', function(newValue, oldValue) {
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#managerPhone1').focus();}
    });
    $scope.$watch('formData.facility_manager_phone_part2', function(newValue, oldValue) {
      
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#managerPhone2').focus();}
    });
    /**
     * Submitter Phone number auto-tab to next form elements
     */
    $scope.$watch('formData.submitter_phone_part1', function(newValue, oldValue) {
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#submitterPhone1').focus();}
    });
    $scope.$watch('formData.submitter_phone_part2', function(newValue, oldValue) {
      if (newValue === null || newValue === undefined || (newValue === oldValue)) {return}
      if (newValue.length === 3) {angular.element('#submitterPhone2').focus();}
    });
    
    
    /**
     * Gallery Images
     */
    $scope.initGalleryImages = function()
    {
      $timeout(function() {
        $scope.formData.galleryImages.splice(0, $scope.formData.galleryImages.length);
        if ($scope.community.gallery !== null) {
          angular.extend($scope.formData.galleryImages, $scope.community.gallery.images);
        }  
      }, 0);
    };
    $scope.removeGalleryImage = function($index)
    {
      $scope.galleryImagesHistory.addCurrent();
      // console.log('removeGalleryImage(), $index: ', $index);
      $timeout(function() {
        $scope.formData.galleryImages.splice($index, 1);
      }, 0)
    };
    // adding gallery images
    $scope.galleryImagesAddBuffer = [];
    $scope.maxGalleryImages = 10;
    $scope.$watch('galleryImagesAddBuffer', function(newValue, oldValue) {
      $scope.galleryImagesHistory.addCurrent();
      //console.log('galleryImagesAddBuffer changed from oldValue: ', oldValue, ' to newValue: ', newValue);
      $timeout(function() {
        for (var key in $scope.galleryImagesAddBuffer) {
          var image = $scope.galleryImagesAddBuffer[key];
          if ($scope.formData.galleryImages.length < $scope.maxGalleryImages) {
            $scope.formData.galleryImages.push(image);  
          }
        }
        if ($scope.galleryImagesAddBuffer !== undefined) {
          $scope.galleryImagesAddBuffer.splice(0, $scope.galleryImagesAddBuffer.length )
        }
      }, 0);
    });
    $scope.revertGalleryImages = function() {
      //$scope.initGalleryImages();
      $scope.galleryImagesHistory.revert();
    };
    
    $scope.galleryImagesHistory = {
      history : [],
      addCurrent : function() {
        if ($scope.formData.galleryImages !== undefined) { 
          this.history.push($scope.formData.galleryImages.slice(0));
        }
      },
      revert : function() {
        $timeout(function() {
          $scope.formData.galleryImages = this.history.pop();  
        }.bind(this), 0);
      }
    };
    
    
    /**
     * Dummy Data
     */
    $scope.dummyData = {  
       "name":"Pretend Community",
       "address1":"130 S. Meridian St.",
       "address2":"Suite 101",
       "city":"Indianapolis",
       "state":"Indiana",
       "zip":"46225",
       "phone_part1":"317",
       "phone_part2":"444",
       "phone_part3":"4639",
       "email":"james.earlywine@indystar.com",
       "website":"http://thefineryears.indystardev.com",
       "regions":{  
          "1":{  
             "id":"1",
             "name":"North",
             "selected":true
          },
          "2":{  
             "id":"2",
             "name":"South",
             "selected":false
          },
          "3":{  
             "id":"3",
             "name":"East",
             "selected":true
          },
          "4":{  
             "id":"4",
             "name":"West",
             "selected":false
          },
          "5":{  
             "id":"5",
             "name":"Inner I-465",
             "selected":true
          }
       },
       "communityCategories":{  
          "1":{  
             "id":"1",
             "name":"Limited Maintenance/Maintenance Free",
             "selected":false
          },
          "2":{  
             "id":"2",
             "name":"Independent Living",
             "selected":false
          },
          "3":{  
             "id":"3",
             "name":"Continuing Care Retirement Communities",
             "selected":true
          },
          "4":{  
             "id":"4",
             "name":"Assisted Living",
             "selected":true
          },
          "5":{  
             "id":"5",
             "name":"Home Care",
             "selected":true
          },
          "6":{  
             "id":"6",
             "name":"On-Site Home Care",
             "selected":true
          },
          "7":{  
             "id":"7",
             "name":"Respite Care",
             "selected":true
          },
          "8":{  
             "id":"8",
             "name":"Memory Care",
             "selected":true
          },
          "9":{  
             "id":"9",
             "name":"Rehabilitation Care",
             "selected":true
          },
          "10":{  
             "id":"10",
             "name":"Nursing/Specialty Care",
             "selected":true
          }
       },
       "image":null,
       "submitter_first_name": "Joe",
       "submitter_last_name": "Schmoe",
       "submitter_phone_part1": "317",
       "submitter_phone_part2": "555",
       "submitter_phone_part3": "1313",
       "submitter_email": "joe@schmoe.com",
       "manager_first_name": "BobbyJo",
       "manager_last_name": "Johnson",
       "manager_phone_part1": "317",
       "manager_phone_part2": "555",
       "manager_phone_part3": "1414",
       "manager_email": "bobbyjo@johnson.com",

    };
    $scope.populateWithDummyData = function()
    {
      angular.extend($scope.formData, $scope.dummyData);
      $scope.validateCategorySelected();
    };


    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-advertise-enhanced'
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