/* globals angular */
window.scriptBasepath.detectFor('RoutableAdvertiseSignup');

/**
 * dependencies injected
 */
angular.module('app.signup', [
  
])

/**
 * Route
 */
.config(['$stateProvider', function($stateProvider) {
    
  $stateProvider
    .state('signup', {
      url: '/signup',
      templateUrl: window.scriptBasepath.for('RoutableAdvertiseSignup') + 'signup.html', // relative to document root
      controller: 'SignupCtrl',
      resolve: {
        communityCategories : ['CommunityCategoriesService', function(CommunityCategoriesService) {
          return CommunityCategoriesService.getCommunityCategories();
        }],
        regions: ['RegionsService', function(RegionsService) {
          return RegionsService.getRegions();
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
.controller('SignupCtrl', [
    '$window',
    '$scope',
    '$state',
    '$timeout',
    'AppConfig',
    'OmnitureService',
    'AdvertiseService',
    'BusyAnimationService',
    'communityCategories', 
    'regions',
  function(   
    $window,
    $scope,
    $state,
    $timeout,
    AppConfig,
    OmnitureService,
    AdvertiseService,
    BusyAnimationService,
    communityCategories,
    regions
) {
  
    /* debug */
    window.appDebug.SignupCtrl         = $scope;

    /**
     * Scope Initialization
     */
    $scope.communityCategories  = communityCategories;
    $scope.regions              = regions;

    
    /* signup controller entry */
    $scope.main = function() {
      
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
      phone_part1: '',
      phone_part2: '',
      phone_part3: '',
      email: null,
      website: null,
      regions: {},
      communityCategories: {},
      image: null,
      facility_manager: null,
      facility_manager_phone_part1: '',
      facility_manager_phone_part2: '',
      facility_manager_phone_part3: '',
      facility_manager_email: null,
      submitter_name: null,
      submitter_phone_part1: '',
      submitter_phone_part2: '',
      submitter_phone_part3: '',
      submitter_email: null,
    };
    $scope.initCommunityCategories = function() 
    {
      for (var key in $scope.communityCategories) {
        var item = $scope.communityCategories[key];
        item.selected = false;
        $scope.formData.communityCategories[item.id] = item;
      }
    };
    $scope.initCommunityCategories();
    $scope.initRegions = function() 
    {
      for (var key in $scope.regions) {
        var item = $scope.regions[key];
        item.selected = false;
        $scope.formData.regions[item.id] = item;
      }
    };
    $scope.initRegions();
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
      
      // form submit has been attempted at least once (irrespective of validation outcome)
      $scope.submitted = true;
      
      $scope.validatePhoneNumber();
      $scope.validateImage();
      $scope.validateCategorySelected();
      
      /* dummy validation pass
        isValid = true;
        $scope.categorySelected = true;
        $scope.imageValid = true;
      */
      
      // if the form passes validation, 
      if (isValid) {
          // console.log('passes built-in validation');
          
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
        angular.element('html, body')
          .animate(
            {
              scrollTop: angular.element('input.ng-invalid').first().offset().top - 40 // scroll some pixels above the form element
            }, 
            500, // animation duration (ms)
            function(){ // then..
              // focus that element for input
              angular.element('input.ng-invalid').first().focus();
            }
          )
        ;
      }
    };
    $scope.sendDataError = null;
    $scope.sendData = function()
    {
      BusyAnimationService.start();
      $scope.buildFormSubmitData();
      AdvertiseService.signup.submit($scope.formSubmitData)
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
      console.log('confirmSendDataSuccess()');
      $scope.sendComplete = true;
      $state.go('confirmation', {}, {});
    };
    $scope.indicateSendDataFailure = function()
    {
      console.log('indicateSendDataFailure()');
      $scope.sendComplete = true;
      $scope.response = AdvertiseService.signup.get('lastResponse');
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
      $scope.formSubmitData = angular.extend({}, $scope.formData);
      
      $scope.formSubmitData.communityCategories = [];
      for (var key in $scope.formData.communityCategories) {
        var item = $scope.formData.communityCategories[key];
        if (item.selected) {$scope.formSubmitData.communityCategories.push(item.id);}
      }
      
      $scope.formSubmitData.regions = [];
      for (var key in $scope.formData.regions) {
        var item = $scope.formData.regions[key];
        if (item.selected) {$scope.formSubmitData.regions.push(item.id);}
      }
      
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
        extension : 'the-finer-years-advertise-signup'
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