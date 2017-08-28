/* globals angular */

/**
 * @brief   Client-Side DataService for interacting with TheFinerYears->Regions webservice
 * @author  James Earlywine - <james.earlywine@indystar.com>
 * @note    Webservice api docs -- http://thefineryears.indystardev.com/webservice/swagger/explore/#/Regions
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
angular.module('RegionsService', [
    'ngLodash'
  ])
  .factory('RegionsService', [
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
            getRegions : '',
          },
          useCache: {
            regions: true
          },
          cache: {
            regions: null
          },
          useDummyData: {
            regions: false
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
         * @brief   Get All Regions
         *
         * @return  promise   resolves with array of communities, indexed by id
         */
        getRegions: function() 
        {
          var useCache =  (   this.settings.useCache.regions 
                          &&  this.settings.cache.regions !== null)
          ;
          
          var endpoint  = this.settings.endpoints.getRegions;

          if (!useCache) 
          {
            // console.log('fetching communities from webservice');
            return $http({
                            url: endpoint,
                            method: "GET",
                            params: {apiKey: AppConfig.webserviceApiKey},
                            withCredentials: false
              })
              .then(function(response) {
                this.responseTransformers.getRegions.bind(this)(response);
                this.cache('regions', lodash.keyBy(response.data, 'id') );
                this.lastWebserviceResponse( response );
                return this.cache('regions');
              }.bind(this))
            ;  
          } else {
            // console.log('fetching communities from cache');
            var deferred = $q.defer();
            deferred.resolve( this.cache('regions') );
            return deferred.promise;
          }
          
        }, // end getRegions
       
        
        responseTransformers  : {
          getRegions     : function(response) {
            for (var index in response.data) {
              var region = response.data[index];
              region.id      = region.id.toString();
            } // end for
            
          } // end getRegions responseTransformer 
          
        }, // end responseTransformers
        
        
        
        
        
        
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

