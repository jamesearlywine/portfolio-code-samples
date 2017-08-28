/* global angular */

/**
 * Email Service 
 */
 angular.module('EmailService', [])
	.factory('EmailService', [
			'$http',
			'AppConfig',
		function(
			$http,
			AppConfig
		)
		{
			return {
				
				settings : {
          endpoints: {
						communityRequestMoreInformation		: '',
					}
        },
       
        /**
         * @brief Configure Data Service
         * @note	Params are polymorphic -
         * @param {object} options	a set of options to configure settings
         * @param {string} options	a key, return the corresponding value, return this.settings[key]
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

				sendEmail_communityRequestMoreInformation: function(options)
				{
					var url				= this.config('endpoints').communityRequestMoreInformation;
					var endpoint	= url.replace('{communityId}', options.communityId);

					return $http({
				    method: 'POST',
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
				    data: options
					});

					
				}, // end sendEmail_communityRequestMoreInformation
				
				
				
			};
			
		}
	])
;
		