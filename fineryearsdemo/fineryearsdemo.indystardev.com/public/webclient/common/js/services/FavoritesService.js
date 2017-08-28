/* global angular */

/**
 * Favorites Service 
 */
 angular.module('FavoritesService', [])
	.factory('FavoritesService', [
			'$q',
			'$timeout',
			'$http',
			'$rootScope',
      'AppConfig',
      'CommunitiesService',
      'FilterService',
		function(
			$q,
			$timeout,
			$http,
			$rootScope,
			AppConfig,
			CommunitiesService,
			FilterService
		)
		{
			return {
				
				_favorites : [],
				_favoriteCommunities: [],
				_updateCache : true,
				_updateWebservice: false,
				// defaults
        settings : {
          endpoints: {
						favorites		: '',
					}
        },
       
        /**
         * @brief Configure Data Service
         * @note	Params are polymorphic -
         * @param {object} options	a set of options to configure settings
         * @param {string} options	a key, return the corresponding value, this.settings[key]
         * @param {mixed}  value		if this is passed, options is treated as a key, this.settings[key] = value
         */
        config: function(options, value) 
        {
        	if (typeof options === 'object' && options !== null) {
        		angular.extend(this.settings, options);
        		return this;
        	}
          if (value !== undefined) {
          	this.settings[options] = value;
          	return this;
          }
          return this.settings[options];
        },

				/**
				 * if id exists in this._favorites, return the corresponding index (-1 if not exist)
				 */
				indexById: function(id)
				{
					if (id === undefined) {return -1;}
					if (typeof id !== 'string') {id = id.toString();}
					return this._favorites.indexOf(id);
				},
				
				/**
				 * Add an item(s) to favorites
				 */
				add : function(id, options) {
					var defaultOptions = {
						updateWebservice: this._updateWebservice
					};
					options = angular.extend(defaultOptions, options);

					// if an array was passed
					if (Array.isArray(id)) {
						// add each element in the array
						for (var key in id) {
							this._add(id[key]);
						}
					} else { // otherwise
						// just add the one element
						if (this.indexById(id) === -1) {
							this._add(id);
						}
					}
					if (this._updateCache) {
						if (Array.isArray(id)) {
							for (var key in id) {
								this.decorateCachedCommunityById(id[key]);
							}	
						} else {
							this.decorateCachedCommunityById(id);
						}
					}
					if (options.updateWebservice) {
						return  this.ws_setFavorites()
							.then(this.decorateAllCommunitiesWithFavoritesInfo.bind(this))
							.then(this.broadcastUpdate.bind(this))
						;
					} else {
						return  this.decorateAllCommunitiesWithFavoritesInfo()
							.then(this.broadcastUpdate.bind(this))
						;
					}
					
					return this;
				},
				_add: function(id) {
					if (id === undefined) {return}
					if (typeof id !== 'string') {id = id.toString();}
					if (this.indexById(id) === -1) {
						this._favorites.push(id);
					}
				},
				/**
				 * Remove an item(s) from favorites
				 */
				remove : function(id, options) {
					var defaultOptions = {
						updateWebservice: this._updateWebservice
					};
					options = angular.extend(defaultOptions, options);

					
					// if an array was passed
					if (Array.isArray(id)) {
						// remove each element in the array
						for (var key in id) {
							this._remove(id[key]);
						}
					} else { // otherwise
						// just remove the one element
							this._remove(id);
					}
					if (this._updateCache) {
						if (Array.isArray(id)) {
							for (var key in id) {
								this.decorateCachedCommunityById(id[key]);
							}	
						} else {
							this.decorateCachedCommunityById(id);
						}
					}
					if (options.updateWebservice) {
						return  this.ws_setFavorites()
							.then(this.decorateAllCommunitiesWithFavoritesInfo.bind(this))
							.then(this.broadcastUpdate.bind(this))
						;
					} else {
						return  this.decorateAllCommunitiesWithFavoritesInfo()
							.then(this.broadcastUpdate.bind(this))
						;
					}
					
					return this;
				},
				_remove: function(id) {
					if (typeof id !== 'string') {id = id.toString();}
					if (this.indexById(id) !== -1) {
						this._favorites.splice(this.indexById(id), 1);	
					}
				},
				removeAll: function()
				{
					this._favorites.splice(0, this._favorites.length);
				},
				/**
				 * Set the favorite communities
				 */
				set: function(arrIDs, options) {
					var defaultOptions = {
						updateWebservice: this._updateWebservice
					};
					options = angular.extend(defaultOptions, options);

					this.removeAll();
					this.add(arrIDs);
					if (options.updateWebservice) {
						return  this.ws_setFavorites()
							.then(this.syncCommunitiesFavorites.bind(this))
							.then(this.broadcastUpdate.bind(this))
						;
					} else {
						return  this.syncCommunitiesFavorites()
							.then(this.broadcastUpdate.bind(this))
						;
					}
				},

				broadcastUpdate : function()
				{
					$rootScope.$broadcast('favorites::updated', 
            {
              delay: 100
            }
          );
				},

				isFavoritedById: function(id) 
				{
					return (this.indexById(id) !== -1);
				},

				/**
				 * Decorate an array of communities with isFavorited property
				 */
				syncCommunitiesFavorites: function() {
					return  this.decorateAllCommunitiesWithFavoritesInfo()
						.then(this.updateFavoriteCommunities.bind(this))
					;
				},
				
				decorateAllCommunitiesWithFavoritesInfo: function()
				{
					return CommunitiesService.getCommunities()
						.then(
							function(communities) {
								this.decorateCommunitiesWithFavoritesInfo(communities);
							}.bind(this)
						)
					;
				},
				decorateCommunitiesWithFavoritesInfo: function(arrCommunities)
				{
					for (var key in arrCommunities) {
						var community = arrCommunities[key];
						community.isFavorited = this.isFavoritedById(community.id);
					}
				},
				decorateCachedCommunityById: function(id) 
				{
					var community = CommunitiesService.settings.cache.communities[parseInt(id, 10)];
					if (community !== undefined) {
						community.isFavorited = this.isFavoritedById(id);
					}
				},
				updateFavoriteCommunities: function() 
				{
					CommunitiesService.getCommunities()
						.then(function(communities) {
							this._favoriteCommunities.splice(0, this._favoriteCommunities.length);
							for (var key in communities) {
								var community = communities[key];
								if (community.isFavorited) {
									this._favoriteCommunities.push(community);	
								}
							}
						}.bind(this))
					;
					
				},
				
				
				/**
				 * Web Service Methods
				 */
			
				/**
				 * Set Favorite(s)
				 */
				
					// this is to stop a bunch of webservice calls when user clicks the favorite "star" many times per second
					// rate-limits how often the webclient updates the webservice.  
					// each webservice PUT request updates webservice with all the user-favorites in the client-side app/service state
					ws_setFavorites_busy: false,
					ws_setFavorites_scheduled: false,
					ws_setFavorites_debounce_limit: 1500, // ms - after PUT requests completes, how much time before repeating?
				ws_setFavorites: function(IDs)
				{
					if (IDs === undefined) {IDs = this._favorites;}
					if (!Array.isArray(IDs)) {IDs = [IDs];}
					var endpoint = this.config('endpoints').favorites;
					if (!this.ws_setFavorites_busy) {
					this.ws_setFavorites_busy = true;
						return $http({
					    method: 'PUT',
					    url: endpoint,
	            params: {
	              apiKey: AppConfig.webserviceApiKey,
	            },
					    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					    transformRequest: function(obj) {
					        var str = [];
					        for(var p in obj)
					        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					        return str.join("&");
					    },
					    data: {
					    	"favorite_communities" : IDs
					    }
						}).then(function(response) {
							this.ws_setFavorites_busy = false;
							return response;
						}.bind(this));					
					} else {
						if (!this.ws_setFavorites_scheduled) {
							this.ws_setFavorites_scheduled = true;
							$timeout(function() {
								this.ws_setFavorites_scheduled = false;	
								this.ws_setFavorites();
							}.bind(this), this.ws_setFavorites_debounce_limit);
						} else {
							// console.log('not scheduling another webservice call, one is already scheduled');
						}
						return $q.when(null);
					}
					
				}, // end ws_setFavorites
				
				
				
			};
			
		}
	])
;
		