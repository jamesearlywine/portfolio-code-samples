/* globals angular */

/**
 * @brief   Client-Side DataService for interacting with TheFinerYears->CommunityCategories webservice
 * @author  James Earlywine - <james.earlywine@indystar.com>
 * @note    Webservice api docs -- http://thefineryears.indystardev.com/webservice/swagger/explore/#/CommunityCategories
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
angular.module('CommunityCategoriesService', [
    'ngLodash'
  ])
  .factory('CommunityCategoriesService', [
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
            getCommunityCategories : '',
          },
          useCache: {
            communityCategories: true
          },
          cache: {
            communityCategories: null
          },
          useDummyData: {
            communityCategories: false
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
        getCommunityCategories: function() 
        {
          var useCache =  (   this.settings.useCache.communityCategories
                          &&  this.settings.cache.communityCategories !== null)
          ;
          
          var endpoint  = this.settings.endpoints.getCommunityCategories;

          if (!useCache) 
          {
            // console.log('fetching communities from webservice');
            return $http.get( endpoint )
              .then(function(response) {
                this.responseTransformers.getCommunityCategories.bind(this)(response);
                this.cache('communityCategories', lodash.keyBy(response.data, 'id') );
                this.lastWebserviceResponse( response );
                return this.cache('communityCategories');
              }.bind(this))
            ;  
          } else {
            // console.log('fetching communities from cache');
            var deferred = $q.defer();
            deferred.resolve( this.cache('communityCategories') );
            return deferred.promise;
          }
          
        }, // end getCommunityCategories
       
        
        responseTransformers  : {
          getCommunityCategories     : function(response) {
            for (var index in response.data) {
              var item = response.data[index];
              item.id      = item.id.toString();
            } // end for
            
          } // end getCommunityCategories responseTransformer 
          
        }, // end responseTransformers
        
        
        
        
        
        
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

