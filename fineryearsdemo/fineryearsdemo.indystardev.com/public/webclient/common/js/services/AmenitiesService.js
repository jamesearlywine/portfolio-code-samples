/* globals angular */

/**
 * @brief   Client-Side DataService for interacting with TheFinerYears->Amenities webservice
 * @author  James Earlywine - <james.earlywine@indystar.com>
 * @note    Webservice api docs -- http://thefineryears.indystardev.com/webservice/swagger/explore/#/Amenities
 * @note  Usage examples:
 * 
 *          config({
 *            endpoints: {
 *              'something' : 'endpoint'
 *            }
 *          })
 * 
 * 
 */
angular.module('AmenitiesService', [
    'ngLodash'
  ])
  .factory('AmenitiesService', [
      '$http',
      '$q',
      'lodash',
      'AppConfig',
    function(
      $http,
      $q,
      lodash,
      AppConfig
    ) {
      
      return {
        // defaults
        settings : {
          // webservice endpoints (see app.js service initialization)
          endpoints: {
            getAmenities : '',
          },
          useCache: {
            amenities: true
          },
          cache: {
            amenities: null
          },
          useDummyData: {
            amenities: false
          },
          lastWebserviceResponse: {}
        },
       
        /**
         * @brief Configure Data Service
         */
        config: function(options) 
        {
          angular.extend(this.settings, options);
          return this;
        },
        cache: function(key, value)
        {
          if (value === undefined) { return this.settings.cache[key]; }
          this.settings.cache[key] = value;
          return this;
        },
        lastWebserviceResponse: function(value)
        {
          if (value === undefined) { return this.settings.lastWebserviceResponse; }
          this.settings.lastWebserviceResponse = value;
          return this;
        },
        
        
        /**
         * @brief   Get All Amenities
         *
         * @return  promise   resolves with array of communities, indexed by id
         */
        getAmenities: function(options) 
        {
          
          if (options === undefined) {
            options = {
              asArray: true
            };
          }
          if (options.asArray === undefined) {options.asArray = true;}
          
          var useCache =  (   this.settings.useCache.amenities 
                          &&  this.settings.cache.amenities !== null)
          ;
          
          var endpoint  = this.settings.endpoints.getAmenities;

          if (!useCache) 
          {
            // console.log('fetching communities from webservice');
            return $http.get( endpoint )
              .then(function(response) {
                this.responseTransformers.getAmenities.bind(this)(response);
                if (options.asArray) {
                  this.cache('amenities', response.data);
                } else {
                  this.cache('amenities', lodash.keyBy(response.data, 'id') );
                }
                this.lastWebserviceResponse( response );
                return this.cache('amenities');
              }.bind(this))
            ;  
          } else {
            // console.log('fetching communities from cache');
            var deferred = $q.defer();
            deferred.resolve( this.cache('amenities') );
            return deferred.promise;
          }
          
        }, // end getAmenities
       
        
        responseTransformers  : {
          getAmenities     : function(response) {
            for (var index in response.data) {
              var region = response.data[index];
              region.id      = region.id.toString();
            } // end for
            
          } // end getAmenities responseTransformer 
          
        }, // end responseTransformers
        
        
        
        
        
        
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

