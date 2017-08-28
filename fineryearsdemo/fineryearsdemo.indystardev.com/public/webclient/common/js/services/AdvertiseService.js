/* globals angular, File, Blob */

/**
 * @brief   Advertise Service (advertise signup webservice interaction)
 * @author  James Earlywine - <james.earlywine@indystar.com>
 */
angular.module('AdvertiseService', [
    
  ])
  .factory('AdvertiseService', [
      '$http',
      '$q',
      'AppConfig',
    function(
      $http,
      $q,
      AppConfig
    ) {
      
      return {
        
        /**
         * Advertiser Signup
         */
        signup: {
          settings: {
            endpoints: {
              submitCommunity: null
            },
            lastErrors: null,
            lastValidationErrors: null,
            lastFormData: null,
            lastResponse: null
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
           * @brief Submit community for advertising
           * @param {formData} an object containing many properties, see advertise/app/signup/signup.js controller $scope.formData
           * @return promise  from $http
           */
          submit: function(formData)
          {
            // console.log('AdvertiseService submitting formData: ', formData);
            var fd = new FormData();
            for (var key in formData) {
              fd.append(key, formData[key])
            }
            fd.append('apiKey', AppConfig.webserviceApiKey);
            
            this.set('lastFormData', fd);
            // console.log( 'submitting fd FormData: ', this.get('lastFormData') );
            
            var url = this.get('endpoints').submitCommunity;
            return $http
              .post(
                url, 
                fd, 
                {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': undefined}
                }
              )
              .then(
                function(response) {
                  this.set('lastResponse', response);
                  return response;
                }.bind(this), 
                function(response) {
                  this.set('lastResponse', response);
                  return response;
                }.bind(this)
              )
            ;

          },
          
          
        }, // end signup
        
        /**
         * Advertiser Enhanced
         */
        enhanced: {
          settings: {
            endpoints: {
              updateCommunity: null
            },
            lastErrors: null,
            lastValidationErrors: null,
            lastFormData: null,
            lastResponse: null
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
          
          requestTransformers: {
            update: function(formData) {
              // amenities
              formData.amenities            = JSON.stringify(formData.amenities);
              // image
              // logo image (polymorphic, either a pojo object or a File object)
              formData.imageData            = JSON.stringify(formData.image);
              // community categories
              formData.communityCategories  = JSON.stringify(formData.communityCategories);
              
              
              if (! (formData.image instanceof File)
               && ! (formData.image instanceof Blob)
              ) {
                formData.image = null;
              }
              
              
              // gallery images
              formData.galleryImagesData  = JSON.stringify(formData.galleryImages);
              for (var i = 0; i < formData.galleryImages.length; i++) {
                formData['galleryImageFiles_' + i] = 
                  formData.galleryImages[i] instanceof File
                  ? formData.galleryImages[i]
                  : formData.galleryImages[i] instanceof Blob
                    ? formData.galleryImages[i]
                  : null
                ;
              }
              
            }
          },
          
          /**
           * @brief Submit community for advertising
           * @param {formData} an object containing many properties, see advertise/app/signup/signup.js controller $scope.formData
           * @return promise  from $http
           */
          update: function(formData)
          {
            // adjust formData (amenities, image, galleryImages);
            this.requestTransformers.update(formData);

            // console.log('AdvertiseService submitting formData: ', formData);
            var fd = new FormData();
            for (var key in formData) {
              fd.append(key, formData[key]);
            }
            fd.append('apiKey', AppConfig.webserviceApiKey);
            //fd.append('enhanced_update_api_key', formData.key);
            fd.append('_method', 'PUT');
            
            this.set('lastFormData', fd);
            // console.log( 'submitting fd FormData: ', this.get('lastFormData') );
            
            var url = this.get('endpoints').updateCommunity;
            return $http
              .post(
                url, 
                fd, 
                {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': undefined}
                }
              )
              .then(
                function(response) {
                  this.set('lastResponse', response);
                  return response;
                }.bind(this), 
                function(response) {
                  this.set('lastResponse', response);
                  return response;
                }.bind(this)
              )
            ;

          },
          
          
        } // end enhanced
        
          
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

