/* globals angular, $ */

/**
 * dependencies injected
 */
angular.module('app.modals.login', [
  'myEnter'
])

/**
 * Controller
 */
// controllers definition 
.controller('ModalLoginCtrl', [
    '$q',
    '$window',
    '$scope',
    '$state',
    '$timeout',
    '$uibModalInstance',
    'Facebook',
    'AppConfig',
    'AuthService',
    'OmnitureService',
    'BrowserDetectionService',
  function(
    $q,
    $window,
    $scope,
    $state,
    $timeout,
    $uibModalInstance,
    Facebook,
    AppConfig,
    AuthService,
    OmnitureService,
    BrowserDetectionService
) {
  
    /* debug */
    window.appDebug.ModalLoginCtrl         = $scope;
    
    /**
     * Scope initialization
     */
    $scope.initRegister = function() 
    {
      $scope.registerEmail.value1 = null;
      $scope.registerEmail.error1 = null;
      $scope.registerEmail.value2 = null;
      $scope.registerEmail.error2 = null;
      if (!BrowserDetectionService.isMobile) {
        $('#emailRegister1').focus();
      }
    };
    $scope.initEmailLogin = function()
    {
      $scope.loginEmail.value = null;
      $scope.loginEmail.error = null;
      if (!BrowserDetectionService.isMobile) {
        $('#emailLogin').focus();
      }
    };



    /**
     * Controller Entry
     */
    $scope.main = function() {
      $timeout(function() {
        $scope.initRegister();
        $scope.initEmailLogin();
      }, 100);
      

    };
    
    /**
     * Login
     */
    $scope.loginEmail = {
      value: null,
      error: null
    };
    $scope.loginAttempted = false;
    $scope.loginFailed    = false;
    $scope.attemptLogin = function()
    {
      $scope.loginAttempted = true;
      if ($scope.loginEmail.value === undefined) { 
        $timeout(function() {
          $scope.loginEmail.error = 'Please enter a valid email address.';   
        });
        return;
      }
      $scope.login();
    };
    $scope.$watch('loginEmail.value', function(newValue, oldValue) {
      if ($scope.loginAttempted && !$scope.loginFailed) {
        if ($scope.loginEmail.value !== undefined) {
          $scope.loginEmail.error = null;
        }
      }
    });     
    $scope.login = function()
    {
      AuthService.guest.login($scope.loginEmail.value).then(function(response) {
        // console.log('login attmepted using email: ', $scope.loginEmail.value, ' response: ', response);
        if (response.errors !== undefined) {
          for (var key in response.errors) {
            if (response.errors[key].number === 202) { 
              $scope.loginEmail.error = 'Please enter a valid email address.'; 
              $scope.loginFailed = true;
              return;
            }
            if (response.errors[key].number === 303) {
              $timeout(function() {
                $scope.registerEmail.value1 = $scope.loginEmail.value;
                $scope.slideToRegister();  
                $timeout(function() {
                  $('#emailRegister2').focus();
                }, 100)
              });
            }
          }
        } else {
          $scope.close(response);
        }
      });
    };
    
    /**
     * Registration
     */
    $scope.registerEmail = {
      value1 : null,
      error1 : null,
      value2 : null,
      error2 : null
    };
    $scope.registrationAttempted = false;
    $scope.attemptRegister = function(updateAttempted)
    {
      if (updateAttempted === undefined) {updateAttempted = true;}
      $timeout(function() {
        $scope.registerEmail.error1 = null;
        $scope.registerEmail.error2 = null;
      });
      
      if (updateAttempted) { $scope.registrationAttempted = true; }
      
      if ($scope.registerEmail.value1 === undefined) { 
        $timeout(function() {
          $scope.registerEmail.error1 = 'Please enter a valid email address.';   
        });
        return;
      }
      if ($scope.registerEmail.value2 === undefined && $scope.registrationAttempted) { 
        $timeout(function() {
          $scope.registerEmail.error2 = 'Please enter a valid email address.';   
        });
        return;
      }
      if ($scope.registerEmail.value1 !== $scope.registerEmail.value2) {
        $timeout(function() {
          $scope.registerEmail.error2 = 'Please confirm your email address.';   
        });
        return;
      }
      
      $scope.register($scope.registerEmail.value2);
      
    };
    $scope.register = function(email)
    {
      AuthService.guest.register(email).then(function(response) {
        // console.log('registration attempted, response: ', response);
        if (response.errors !== undefined) {
          for (var key in response.errors) {
            if (response.errors[key].number === 202) { 
              $scope.registerEmail.error1 = 'Please enter a valid email address.'; 
              return;
            }
            if (response.errors[key].number === 301) {
              $timeout(function() {
                $('#emailRegister1').focus();
                $scope.registerEmail.error1 = 'That email is already in use, try another.'
                $scope.registerEmail.value2 = null;
                $scope.registerEmail.error2 = null;
              });
            }
          }
        } else {
          $scope.close(response);
          $scope.$root.$broadcast('authalert::loggedIn');
        }
        
        
      });
    };
    
    /**
     * On Enter Handlers
     */
    $scope.registerEmail1EnterHandler = function() { $('#emailRegister2').focus();  };
    $scope.registerEmail2EnterHandler = function() { $scope.attemptRegister();      };
    $scope.loginEmailEnterHanlder     = function() { $scope.attemptLogin();         };
    
    
    /**
     * Slide View States
     */
    $scope.viewState = 'login'; // 'login', 'register'
    $scope.slideToRegister = function(initRegister) {
      if (initRegister === undefined) { initRegister = false; }
      $timeout(function() { 
        $scope.viewState = 'register';
        if (initRegister) {
          $timeout(function() {
            $scope.initRegister();  
          }, 100)
        }
      }); 
    };
    $scope.slideToLogin = function(initEmailLogin)    { 
      if (initEmailLogin === undefined) { initEmailLogin = false; }
      $timeout(function() { 
        $scope.viewState = 'login';
        if (initEmailLogin) {
          $timeout(function() {
            $scope.initEmailLogin();
          }, 100)
        }
      });    
    };
    
    /**
     * Facebook 
     */
    $scope.deregister_facebookReady = $scope.$watch(function() {
      // console.log('checking if facebook is ready.. ', Facebook.isReady());
      return Facebook.isReady();
    }, function(newVal, oldVal) {
      // console.log('newVal: ', newVal);
      $scope.facebookReady = newVal;
      if ($scope.facebookReady) {
        $scope.waitForFacebookReadyDeferred.resolve(true);
        $scope.deregister_facebookReady();
      }
    });
    
    $scope.waitForFacebookReadyDeferred = $q.defer();
    $scope.waitForFacebookReady = $scope.waitForFacebookReadyDeferred.promise;
    
    $scope.facebookLogin = function() 
    {
      $scope.waitForFacebookReady.then(function() {
        AuthService.guest.facebookLoginFull()
          .then(
            function(response) {
              // console.log('facebookLoginFull response:', response);
              if (response.loggedIn) {
                // console.log('login or register on the server, facebook email: ', response.user.email);
                AuthService.guest.registerLogin(response.user.email)
                  .then(
                    function(response) {
                      $scope.close(response);  
                    }
                  );
              } else {
                // console.log('facebook login unsuccessful, do nothing');
              }
            }
          )
          
        ;  
      });
    };

    
    /**
     * Omniture
     */
    $scope.omniture = {
        extension : 'the-finer-years-login'
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
  
    /**
     * on login
     */
    $scope.$on('AuthService::loggedIn', function(event, args) {
      $scope.close();
    });

    /**
     * Close Modal
     */
    $scope.cancel = function()    { $uibModalInstance.dismiss('cancel');  };
    $scope.close = function(msg)  { $uibModalInstance.close(msg);         };

    
    /* kick it off */
    $scope.main();
      
  } // end function
]) // end controller

;