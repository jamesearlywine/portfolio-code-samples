'use strict';
/* globals angular */
/**
 * @brief   Angular Service for Omniture Reporting
 * @author  james.earlywine@indystar.com
 * @date    November 4th, 2016
 * @note    Uses iframe transport
 */
 
 /* gets base path of script, for storing the path to the iframe transport html file */
window.scriptBasepath.detectFor('OmnitureService');
angular.module('OmnitureService', [])
  .factory('OmnitureService', 
    [
        // injectables
      function(
        // injections
      )
      {
        
        return {
          re_settings: {
            path              : null,
            section           : null, // legacy api support
            extension         : null, // legacy api support
            _url              : null, 
          },
          settings : {
              iframeTransportId : 'omnitureTrackingiFrameTranpsort',
              baseEndpoint      : window.scriptBasepath.for('OmnitureService') + 'OmnitureServiceTransport.html', 
              path              : null,
              section           : null, // legacy api support
              extension         : null, // legacy api support
              showDevice        : true,
              debugTransport    : true,
              _url              : null, 
              _iFrameElement    : null
          },
          config: function(options) {
            for (var key in options) {
              var value = options[key];
              this.setting(key, value);
            }
            return this;
          },
          setting : function(key, value) {
            if (value === undefined) {return this.settings[key];}
            if (value !== undefined) {
                this.settings[key] = value;
                return this;
            }
            return this.settings[key];
          },
          set : function(key, value) { // legacy api support
            return this.setting(key, value);
          },
          reset: function() {
            this.config(this.re_settings);
            return this;
          },
          report : function(options) {
            
            // update options if any were passed
            if (options === undefined) {options = {};}
            this.config(options);
            
            /* legacy api support */
            if (this.setting('path') === null) {
              this.settings.path = '/story/' + this.settings.section + '/' + this.settings.extension;
            }
            
            // build the new iframe url
            this._buildURL();
            
            // console.log('remove any existing iframe');
            if (this.setting('_iFrameElement')) {
              this.setting('_iFrameElement').parentNode.removeChild(this.setting('_iFrameElement'));
            }
      
            // console.log('build and append new iframe);
            this.setting('_iFrameElement', document.createElement('iframe') );
            this.setting('_iFrameElement').style.width      = '0px';
            this.setting('_iFrameElement').style.height     = '0px';
            this.setting('_iFrameElement').style.visibility = 'hidden';
            this.setting('_iFrameElement').setAttribute('id', this.setting('iframeTransportId'));
            document.body.appendChild(this.setting('_iFrameElement'));
            this.setting('_iFrameElement').setAttribute('src', this.setting('_url'));
      
            // reset service state
            this.reset();
          },
          _buildURL : function() {
            this.setting('_url', 
              this.settings.baseEndpoint 
              + '?path='            + encodeURIComponent(this.settings.path)
              + '&showDevice='      + encodeURIComponent(this.settings.showDevice)
              + '&debugTransport='  + encodeURIComponent(this.settings.debugTransport)
              
            );
            return this.setting('_url');
          }
          
        
        }; // end return
        
      } // end function
    ]
  ) // end factory
; // end module