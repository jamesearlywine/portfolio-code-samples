/* globals angular */

/**
 * @brief   Auth Service
 * @note    Webservice Docs for Guest Auth - http://thefineryears.indystardev.com/webservice/swagger/explore/#/GuestAuth
 * @author  James Earlywine - <james.earlywine@indystar.com>
 */
angular.module('AuthService', [
    'facebook'
  ])
  .factory('AuthService', [
      '$http',
      '$q',
      '$uibModal',
      '$rootScope',
      'Facebook',
      'AppConfig',
    function(
      $http,
      $q,
      $uibModal,
      $rootScope,
      Facebook,
      AppConfig
    ) {
      
      var service = {
        
        /**
         * Guest Auth
         */
        guest: {
          settings: {
            endpoints: {
              whoami: null,
              exists: null,
              register: null,
              login: null,
              logout: null,
            },
            loginModalOptions: {
              animation   : null,
              windowClass : null,
              templateUrl : null,
              controller  : null,
              size        : null,
              resolve     : {
    						
              }
            },
            whoami: null,
            isLoggedIn: false,
            lastErrors: null,
            lastValidationErrors: null,
            lastResponse: null,
            facebook: {
              loggedIn: false,
              user: null
            }
          },
          config: function(settings)
          {
            angular.extend(this.settings, settings);
            return this;
          },
          set: function(key, value)
          {
            this.settings[key] = value;
            return this;
          },
          get: function(key)
          {
            if (key === undefined) {return this.settings;}
            return this.settings[key];
          },
          
          /**
           * @brief   Whoami?  - Who am I currently identified as?
           * @param   {bool}    useCache  useCached data if it exists?
           * 
           * @return  promise   resolve with this.settings.whoami (after optional fetch from webservice)
           */
          whoami: function(useCache)
          {
            var deferred = $q.defer();
            if (useCache === undefined) {useCache = true;}
            if (useCache 
              && (
                    this.get('whoami') !== null
                &&  this.get('whoami') !== undefined
                )
            ) {
              deferred.resolve(this.get('whoami'));
              return deferred.promise;
            }
            var url = this.get('endpoints').whoami;
            return $http({
              method: 'GET',
              url: url,
              params: {apiKey: AppConfig.webserviceApiKey}
            })
            .then(function(response) {
              this.set('lastResponse', response);
              if (response.data.errors !== undefined) {
                this.set('lastErrors', response.data.errors);
                if (response.data.validationErrors !== undefined) {
                  this.set('lastValidationErrors', response.data.validationErrors);
                }
              } else {
                this.set('whoami', response.data.whoami);
                this.set('isLoggedIn', this.get('whoami') !== null);
              }
              return this.get('whoami');
            }.bind(this));
          },
          
          /**
           * @brief Ensure guest is logged in
           * 
           * @return promise, resolves with whoami (whether resolved or rejected)
           */
          ensureLoggedIn: function()
          {
            var deferred = $q.defer();
            if ( !this.get('isLoggedIn') ) {
    					this.promptLogin()
    		        .then(
    		          function(result) {
    		          	this.deferred.resolve(this.that.whoami());
    		          }.bind({that: this, deferred: deferred}),
    		          function() {
    		          	this.deferred.reject(this.that.whoami());
    		          }.bind({that: this, deferred: deferred})
    		        )
    		      ;
    				}	else {
    					deferred.resolve(this.whoami());
    				}

            return deferred.promise;
          },
          
          
          /**
           * @brief   Check if an email address is already registered as a guest
           * @param   {string}  email     Email address that identifies the guest user
           * 
           * @return  promise   resolves with boolean true or false
           */
          exists: function(email)
          {
            var endpoint  = this.get('endpoints').exists;
            var url       = endpoint.replace('{email}', email);
            return $http({
              method: 'GET',
              url: url,
              params: {apiKey: AppConfig.webserviceApiKey}
            })
            .then(function(response) {
              this.set('lastResponse', response);
              return response.data.exists;
            }.bind(this));
          },
          
          /**
           * @brief   Login a guest identified by email only (no password)
           * @param   {string}  email     Email address that identifies the guest user
           * 
           * @return  promise   resolve with this.settings.whoami (after response from webservice, if it returns a success)
           */
          login: function(email)
          {
            var endpoint  = this.get('endpoints').login;
            var url       = endpoint.replace('{email}', email);
            return $http({
              method: 'GET',
              url: url,
              params: {apiKey: AppConfig.webserviceApiKey}
            })
            .then(function(response) {
              this.set('lastResponse', response);
              if (response.data.errors !== undefined) {
                this.set('lastErrors', response.data.errors);
                if (response.data.validationErrors !== undefined) {
                  this.set('lastValidationErrors', response.data.validationErrors);
                }
              } else {
                if (response.data.whoami !== undefined) {
                  this.set('whoami', response.data.whoami);
                  this.set('isLoggedIn', true);
                  this.alertLogin();
                }
              }
              return response.data;
            }.bind(this));
          },
          
          /**
           * @brief   Logout currenlt-logged-in guest
           * 
           * @return  promise   resolve with this.settings.whoami (after response from webservice, if it returns a success)
           */          
          logout: function()
          {
            var url  = this.get('endpoints').logout;
            return $http({
              method: 'GET',
              url: url,
              params: {apiKey: AppConfig.webserviceApiKey}
            })
            .then(function(response) {
              this.set('lastResponse', response);
              if (response.data.errors !== undefined) {
                this.set('lastErrors', response.data.errors);
                if (response.data.validationErrors !== undefined) {
                  this.set('lastValidationErrors', response.data.validationErrors);
                }
              } else {
                if (response.data.whoami !== undefined) {
                  this.set('whoami', null);
                  this.set('isLoggedIn', false);
                  this.alertLogout();
                }
              }
              return response.data;
            }.bind(this));
          },
          
          /**
           * @brief   Register a guest user (email only)
           * @param   {string}  email     Email address that identifies the guest user
           * 
           * @return  promise   resolve with this.settings.whoami (after response from webservice, if it returns a success)
           */          
          register: function(email)
          {
            var endpoint  = this.get('endpoints').register;
            var url       = endpoint.replace('{email}', email);
            return $http({
              method: 'GET',
              url: url,
              params: {
                apiKey: AppConfig.webserviceApiKey,
                login: this.get('autoLoginAfterRegister')
              }
            })
            .then(function(response) {
              this.set('lastResponse', response);
              if (response.data.errors !== undefined) {
                this.set('lastErrors', response.data.errors);
                if (response.data.validationErrors !== undefined) {
                  this.set('lastValidationErrors', response.data.validationErrors);
                }
              } else {
                if (response.data.whoami !== undefined) {
                  this.set('whoami', response.data.whoami);
                  this.set('isLoggedIn', true);
                } 
              }
              return response.data;
            }.bind(this));
          }, 
          
          /**
           * @brief   Register a guest user and/or log them in
           * @param   {string}  email     Email address that identifies the guest user
           * 
           * @return  promise   resolve with this.settings.whoami (after response from webservice, if it returns a success)
           */          
          registerLogin: function(email)
          {
            var endpoint  = this.get('endpoints').registerLogin;
            var url       = endpoint.replace('{email}', email);
            return $http({
              method: 'GET',
              url: url,
              params: {
                apiKey: AppConfig.webserviceApiKey,
                login: this.get('autoLoginAfterRegister')
              }
            })
            .then(function(response) {
              this.set('lastResponse', response);
              if (response.data.errors !== undefined) {
                this.set('lastErrors', response.data.errors);
                if (response.data.validationErrors !== undefined) {
                  this.set('lastValidationErrors', response.data.validationErrors);
                }
              } else {
                if (response.data.whoami !== undefined) {
                  this.set('whoami', response.data.whoami);
                  this.set('isLoggedIn', true);
                  this.alertLogin();
                } 
              }
              return response.data;
            }.bind(this));
          },
          
          /**
           * @brief Popup a modal to prompt the user to login/register
           * @note  https://angular-ui.github.io/bootstrap/
           * @return promise  $uibModal.open().result
           */
          promptLogin: function()
          {
            this.set('modal', 
              $uibModal.open( this.get('loginModalOptions') ) 
            ); 
            this.get('modal').result
              .then(function(result) {
                  // console.log('Modal closed with result: ', result);
              },
              function() {
                  // console.log('Modal dismissed at: ' + new Date());
              })
            ;
            return this.get('modal').result;
          },
          
          /**
           * Alerts
           */
          alertLogin : function()
          {
            $rootScope.$broadcast('authalert::loggedIn');
          },
          alertLogout : function()
          {
            $rootScope.$broadcast('authalert::loggedOut');
          },
          
          /**
           * Facebook
           */
          facebookLogin: function() {
            // From now on you can use the Facebook service just as Facebook api says
            var deferred = $q.defer();
            Facebook.login(
              function(response) {
                // console.log('Facebook.login response: ', response);
                this.deferred.resolve(response);
              }.bind({that: this, deferred: deferred}),
              {scope: 'email,public_profile', return_scopes: true}
            );
            return deferred.promise;
          },
      
          facebookGetLoginStatus: function() {
            var deferred = $q.defer();
            
            Facebook.getLoginStatus(
              function(response) {
                if(response.status === 'connected') {
                  // console.log('facebookGetLoginStatus, logged in');
                  this.that.get('facebook').loggedIn = true;
                } else {
                  // console.log('facebookGetLoginStatus, not logged in');
                  this.that.get('facebook').loggedIn = false;
                }
                this.deferred.resolve(this.that.get('facebook').loggedIn);
              }.bind({that: this, deferred: deferred})
            );
            
            return deferred.promise;
          },
      
          facebookMe: function() {
            var deferred = $q.defer();
            
            Facebook.api('/me', 
              {fields: 'name,email'}, 
              function(response) {
                // console.log('facebookMe response: ', response);
                // this.that.get('facebook').user = response;
                this.deferred.resolve(response);
                return response;
              }.bind({that: this, deferred: deferred})
            );
            
            return deferred.promise;
          },
          
          facebookLoginFull: function()
          {
            var deferred = $q.defer();
            this.facebookLogin().then(
              function(response) {
              	if (response.authResponse) {
              	  this.that.facebookMe().then(
                	  function(response) {
                	    this.that.get('facebook').loggedIn = true;
                	    this.that.get('facebook').user = response;
                	    this.deferred.resolve(this.that.get('facebook'))
                	  }.bind(this))
              	} else {
              	  this.that.get('facebook').loggedIn = false;
              	  this.that.get('facebook').user = null;
              	  this.deferred.resolve(this.that.get('facebook'));
              	}
              }.bind({that: this, deferred: deferred})
            );
            return deferred.promise;
          }
          
        }, // end guest
        
        
          
      }; // end service

      return service;
    } // end function
  ]) // end service factory 
; // end angular module

