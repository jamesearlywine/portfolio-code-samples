/* globals angular */

/**
 * @brief   Client-Side DataService for interacting with TheFinerYears->Communities webservice
 * @author  James Earlywine - <james.earlywine@indystar.com>
 * @note    Webservice api docs -- http://thefineryears.indystardev.com/webservice/swagger/explore/#/Communities
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
angular.module('CommunitiesService', [
    'ngLodash'
  ])
  .factory('CommunitiesService', [
      '$http',
      '$q',
      'lodash',
      'SortService',
      'AppConfig',
    function(
      $http,
      $q,
      lodash,
      SortService,
      AppConfig
    ) {
      
      return {
        // defaults
        settings : {
          // webservice endpoints (see app.js service initialization)
          endpoints: {
            getCommunities : '',
            getCommunityByEnhancedUpdateApiKey: '',
            getCitiesAndZips: ''
          },
          useCache: {
            communities: true,
            citiesAndZips: true
          },
          cache: {
            communities: null,
            citiesAndZips: null
          },
          useDummyData: {
            communities: false,
            citiesAndZips: false
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
         * @brief   Get All Communities (params supercede service settings, but they do not update them)
         * @todo    Get favorites as well, and decorate communities with favorites (or do it serverside?)
         *
         * @return  promise   resolves with array of communities, indexed by id
         */
        getCommunities_promise: null,
        getCommunities: function() 
        {
          var useCache =  (   this.settings.useCache.communities 
                          &&  this.settings.cache.communities !== null)
          ;
          
          var endpoint  = this.settings.endpoints.getCommunities;
          
          /*
          if (this.settings.useDummyData.communities) {
            // console.log('fetching communities from dummy data');
            var deferred = $q.defer();
            if (this.settings.cache.communities === null) {
              this.cache('communities', DummyDataService.communities);
              this.responseTransformers.getCommunities( {data: this.cache('communities')} );
            }
            deferred.resolve( this.cache('communities') );
            return deferred.promise;
          }
          */
          
          if (!useCache) 
          {
            // only fetch once
            if (this.getCommunities_promise !== null) {return this.getCommunities_promise;}
            // console.log('fetching communities from webservice');
            this.getCommunities_promise = $http({
                            url: endpoint,
                            method: "GET",
                            params: {apiKey: AppConfig.webserviceApiKey},
                            withCredentials: false
              })
              .then(function(response) {
                this.responseTransformers.getCommunities.bind(this)(response);
                var communities           = SortService.sort('communities', response.data);
                // var sortedCommunities   = SortService.sort('communities', communities);
                // var indexedCommunities  = lodash.keyBy(sortedCommunities, 'id');
                this.cache('communities', communities);
                this.lastWebserviceResponse( response );
                return this.cache('communities');
              }.bind(this))
            ;
            
            return this.getCommunities_promise;
          } else {
            // console.log('fetching communities from cache');
            var deferred = $q.defer();
            deferred.resolve( this.cache('communities') );
            return deferred.promise;
          }
          
        }, // end getCommunities
        
        /**
         * @brief Get Community by id
         * @param {int or string} id Community id
         * @returns promise resolved with single Community
         */
        getCommunityById: function(id)
        {
          id = id.toString();
          var deferred = $q.defer();
          return this.getCommunities()
            .then(
              function(communities) {
                // var community = this.CommunitiesService.settings.cache.communities[this.id];
                var community = null;
                for (var key in this.CommunitiesService.settings.cache.communities) {
                  if ( this.CommunitiesService.settings.cache.communities[key].id.toString() === id.toString() )
                  {
                    community = this.CommunitiesService.settings.cache.communities[key];
                  }
                }
                this.deferred.resolve(community);
                return this.deferred.promise;
              }.bind({CommunitiesService: this, deferred: deferred, id: id})
            )
          ;
        },
        
        /**
         * @brief Get Community by enhanced_update_api_key
         * @param {int or string} enhanced_update_api_key for community
         * @returns promise $http.response.data
         */
        getCommunityByEnhancedUpdateApiKey: function(key)
        {
          this.cache('communityByEnhancedUpdateKey', undefined );
          key = key.toString();
          var endpoint = this.settings.endpoints.getCommunityByEnhancedUpdateApiKey;
          return $http({
                            url: endpoint,
                            method: "GET",
                            params: {
                              apiKey: AppConfig.webserviceApiKey,
                              enhanced_update_api_key: key
                            }
            })
            .then(function(response) {
              this.responseTransformers.getCommunityByEnhancedUpdateKey.bind(this)(response);
              this.cache('communityByEnhancedUpdateKey', response.data );
              this.lastWebserviceResponse( response );
              return this.cache('communityByEnhancedUpdateKey');
            }.bind(this))
          ;
          
        },
        
        /**
         * @brief   Get cities and zips enmuration of unique values for all communities
         *
         * @return  promise   resolves with array 
         */
        getCitiesAndZips: function() 
        {
          var useCache =  (   this.settings.useCache.citiesAndZips 
                          &&  this.settings.cache.citiesAndZips !== null)
          ;
          
          var endpoint  = this.settings.endpoints.getCitiesAndZips;

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
                this.responseTransformers.getCitiesAndZips.bind(this)(response);
                var citiesAndZips           = response.data
                this.cache('citiesAndZips', citiesAndZips);
                this.lastWebserviceResponse( response );
                return this.cache('citiesAndZips');
              }.bind(this))
            ;  
          } else {
            // console.log('fetching communities from cache');
            var deferred = $q.defer();
            deferred.resolve( this.cache('citiesAndZips') );
            return deferred.promise;
          }
          
        }, // end getCitiesAndZips
        
        
        
        responseTransformers  : {
          'getCommunities'     : function(response) {
            
            for (var index in response.data) {
              var community = response.data[index];
              community.id      = community.id.toString();
              if (community.website !== null && community.website !== undefined) {
                community.website = community.website.replace(/.*?:\/\//g, "");
              }
            } // end for
            
          },// end getCommunities responseTransformer 
          
          'getCommunityByEnhancedUpdateKey' : function(response) {
            
              var community = response.data;
              if (community.id !== undefined)       { community.id      = community.id.toString(); }
              if (community.website !== undefined)  { community.website = community.website.replace(/.*?:\/\//g, ""); }
              if (Object.keys(community).length < 1) {response.data = undefined;}
          },// end getCommunityByEnhancedUpdateKey responseTransformer 
          
          'getCitiesAndZips' : function(response) {
            
          }, // end getCitiesAndZips responseTranformer
          
        }, // end responseTransformers
        
        
        
        
        
        
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

