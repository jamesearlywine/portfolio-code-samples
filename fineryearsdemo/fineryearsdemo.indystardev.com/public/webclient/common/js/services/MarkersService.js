/* globals $, angular, google, MarkerWithLabel */

/**
 * @brief   MarkersService - share stateful service 
 *                          for building markers for google maps from communities data
 * @author  James Earlywine - <james.earlywine@indystar.com>
 * @note  This service (and map-info-window directives) expect Marker Data objects 
 *        to have the following API (sample data included):
 *        
    {  
       "id"                   : "2",
       "name"                 : "Clear Vista Lakes",
       "image_url"            : "community_images/1483038716_kSBLqzdQGQ.jpg",
       "address1"             : "8405 Clearvista Pl",
       "address2"             : null,
       "city"                 : "Indianapolis",
       "state"                : "IN",
       "zip"                  : "46256",
       "lat"                  : "39.90897",
       "lng"                  : "-86.0410929",
       "phone"                : "3175787500",
       "phone_ext"            : "",
       "fax"                  : "3175787533",
       "fax_ext"              : "",
       "email"                : null,
       "website"              : "trilogyhs.com/browse-locations/item/clearvista-lake-health-campus",
       "isEnhanced"           : false,
       "facility_manager"     : null,
       "enhanced_intro_text"  : "",
       "s3_image_url"         : "http://indystardev-thefineryears.s3.amazonaws.com/imageCache/community_images/1483038716_kSBLqzdQGQ.jpg"
    }
 * 
 * 
 * 
 */
angular.module('MarkersService', [
    'ngLodash'
  ])
  .factory('MarkersService', [
      '$q',
      '$interpolate',
      '$compile',
      '$timeout',
      '$rootScope',
      'lodash',
      'AppConfig',
      'CommunitiesService',
      'BrowserDetectionService',
    function(
      $q,
      $interpolate,
      $compile,
      $timeout,
      $rootScope,
      lodash,
      AppConfig,
      CommunitiesService,
      BrowserDetectionService
    ) {
      
      return {
        // defaults
        settings : {
          
          map: null,
          
          markerConfig : {
            fillColor     : null,
            opacity       : null,
            path          : null,
            strokeColor   : null,
            strokeWeight  : null,
            scale         : null,  
          },
          
          hoverMarkerConfig : {
            fillColor     : null,
            opacity       : null,
            path          : null,
            strokeColor   : null,
            strokeWeight  : null,
            scale         : null,  
          },
          
          markers : [],
          
          markersData : [],
          
          currentInfoWindow: null,
          currentInfoWindowMarker: null,
          
          
          // internals
          _pinSymbol    : {},
          _infoWindows  : [],
          
          
          // misc
          markerPathLessCurvyPointy : ''
            + 'M18.29,55.17c0,.01,.02,.03,.02,.03S35.83,28.3,35.83,19.46c0-13.01-8.88-18.67-17.54-18.69'
    		    + 'C9.63,.79,.75,6.45,.75,19.46c0,8.84,17.53,35.74,17.53,35.74S18.29,55.17,18.29,55.17'
    		    + 'z'
    		    //+ 'M122.2,187.2c0-33.6,27.2-60.8,60.8-60.8'
    		    // + 'c33.6,0,60.8,27.2,60.8,60.8S216.5,248,182.9,248C149.4,248,122.2,220.8,122.2,187.2'
    		    // + 'z'
          ,
        },
      
        /**
         * @brief Configure Data Service
         */
        config: function(options) 
        {
          angular.extend(this.settings, options);
          return this;
        },
        setting: function(key, value)
        {
          if (value === undefined) { return this.settings[key]; }
          this.settings[key] = value;
          return this;
        },
        
        markerCache : {
          cached : {},
          put: function(id, item) {
            this.cached[id] = item;  
          },
          get: function(id) {
            return this.cached[id] || null;
          },
        },
        infoWindowCache: {
          cached : {},
          put: function(id, item) {
            this.cached[id] = item;  
          },
          get: function(id) {
            return this.cached[id] || null;
          },
        },
        
        

        /**
         *  Adding/Clearing Markers
         */
        setMarkers : function(arrData)
        {
          //var err = new Error();
          //console.log('err.stack: ', err.stack);
          //debugger;
          this.clearMarkers();
          this.addMarkers(arrData);
        },
        clearMarkers : function() 
        {
          // remove from map (so the garbage collector will delete them)
          for (var i = 0; i < this.settings.markers.length; i++) {
            this.settings.markers[i].setMap(null);
          }
          // clear the markers array without deleting it (so we don't break references)
          this.settings.markers.length = 0;
          
          // clear the markersData array (we can break references to this)
          this.settings.markersData.length = 0;
          
          this._clearInfoWindows();
          
          return this;
        },
        _clearInfoWindows : function() {
          // clear the infowindows array without deleting it (so we don't break references)
          this.settings._infoWindows.length = 0; 
        },
        // accepts array or sparse array (object)
        addMarkers : function(arrData) 
        {
          for (var key in arrData) {
            this.setting('markersData').push(arrData[key]);
          }
          this._buildMarkers();
          this.redrawLabelForCommunities(arrData);
        },
        reCalculateInfoWindowsMaxWidth: function() 
        {
          var maxWidth = AppConfig.InfoWindows.maxWidth();
          for (var key in this.settings._infoWindows) {
            var infoWindow = this.settings._infoWindows[key];
            // update max width
            infoWindow.setOptions({maxWidth: maxWidth});
            // if the infowindow is open
            if (infoWindow.isInfoWindowOpen) {
              // redraw
              infoWindow.setMap(this.settings.map);  
            }
          }
        },
        builtMarkersCount : 0,
        _buildMarkersDeferred: null,
        _buildMarkers : function()
        {
          
          this._buildMarkersDeferred = $q.defer();
          if (!this._buildMarkersDeferred === null) {
            return this._buildMarkersDeferred.promise;
          }
          this.builtMarkersCount++;
          //if (this.builtMarkersCount > 10) {return null;}
          return window.getGlobalGoogleMaps.then(function() {
            this._buildInfoWindowMarkers();
            this._buildMarkersDeferred.resolve();
            return this._buildMarkersDeferred.promise;
          }.bind(this));
        },
        _buildInfoWindowMarkers : function() 
        {
          // console.log('MarkersService._buildInfoWindowMarkers()');	     
          /*
          var timers = {
            totalMarkers: {},
          };
          timers.totalMarkers.start = window.performance.now();
          */

          this.setting('_infoWindowTemplate', 
            "<map-info-window community-id='{{id}}' id='map-marker-id-{{id}}'></map>"
          );
          this.setting('_infoWindowTemplateInterpolate',  
            $interpolate( this.setting('_infoWindowTemplate') ) 
          );

  	      for (var key in this.setting('markersData')) {
  	        var markerData    = this.setting('markersData')[key];
  	        
  	        // if a cached marker exists for this community (already bulit)
  	        var cachedMarker = this.markerCache.get(markerData.id);
  	        if (cachedMarker !== null) {
  	          // use that and skip building a marker
  	          // console.log('cachedMarker found: ', cachedMarker);
  	          cachedMarker.setMap(this.setting('map'));
  	          this.setting('markers').push(cachedMarker);
  	          continue;
  	        } else {
  	          // console.log('cachedMarker not found.');
  	        }
  	        
				    var labelContent  = markerData.filterRanking 
				                          ? markerData.filterRanking.toString() 
				                          : markerData.id
				                            ? markerData.id.toString()
				                        : '-'
				    ;
            var label = angular.extend({}, {	text: labelContent }, AppConfig.MarkersService.markerLabel);
            var icon  = AppConfig.MarkersService.markerIcon;

            var zIndex = 400 + parseInt(labelContent, 10);
			      var marker = new google.maps.Marker({
  	            position: new google.maps.LatLng(markerData.lat, markerData.lng),
  	            map: this.settings.map,
  	            // draggable: true,
  	            // raiseOnDrag: true,
  	            label: label,
  	            icon: icon,
  	            optimized: false,
  	            zIndex: zIndex
  	          })
	          ;
	          this.setting('markers').push(marker);
	          this.markerCache.put(markerData.id, marker);
	          
	          
	          /**
	           * Infowindows
	           */
	          // google maps infowindow
	          var cachedInfoWindow = this.infoWindowCache.get(markerData.id);
	          if (cachedInfoWindow !== null) {
	            var infoWindow = cachedInfoWindow;
	          } else {
  	          var infoWindowContent = this.setting('_infoWindowTemplateInterpolate')(markerData);
    			    var infoWindowContentElement = angular.element(infoWindowContent);
    			    var infoWindowContentElementScope = $rootScope.$new();
    			    $compile(infoWindowContentElement)(infoWindowContentElementScope);
              var content = infoWindowContentElement[0];
              
              var infowindow        = new google.maps.InfoWindow({
    	          content: content,
    	          maxWidth: AppConfig.InfoWindows.maxWidth(),
    	          //zIndex: 1000000
    	        });
    			    // add class to parent element (refactor without jquery?)
              google.maps.event.addListener(infowindow, 'domready', function() {
              	var iwOuter = $('.gm-style-iw');
              	var iwBackground = iwOuter.parent();
            		$(iwBackground).addClass('marker-bubble-container');
            		var iwCloseDiv = iwOuter.next();
            		$(iwCloseDiv).addClass('marker-bubble-gmaps-close');
            	});
              this.infoWindowCache.put(markerData.id, infowindow);
	          }
            
	          // click handler for marker
	          var clickEventName = BrowserDetectionService.isIE
	            ? 'mousedown'
	            : 'click'
	          ;
	          marker.addListener(clickEventName, 
	            function(event) {
                this.MarkersService.setting('currentInfoWindowMarker', this.marker);
                this.MarkersService.setting('currentInfoWindow', this.infowindow);
                
							  if (!this.infowindow.isInfoWindowOpen) {
							  	// close all infowindows
		              this.MarkersService.closeAllInfoWindows();
							  	this.infowindow.isInfoWindowOpen = true;
								  
		              // open the info window
		              this.infowindow.open(this.MarkersService.setting('map'), this.marker);
		              
							  } else {
                  this.MarkersService.closeAllInfoWindows();							    
							  }
	            }
	            .bind({
	              MarkersService: this,
	              infowindow: infowindow,
	              infoWindowContent: infoWindowContentElement,
	              marker: marker,
	              markerData: markerData
	            })
	          );
          	if (AppConfig.MarkersService.hoverEffectOnMarkerHover) {
          	  // console.log('binding marker hover events');
          	  marker.addListener('mouseover', 
            	  function(event) {
            	    // console.log('marker hovered');
                  this.MarkersService.growMarkerByCommunityId(parseInt(this.markerData.id, 10));
                  if (BrowserDetectionService.isIE) {return;}
                  /*
                  if (BrowserDetectionService.isIE) {
                    if (this.MarkersService.markerMouseoutTimeout !== undefined) {
                      $timeout.cancel(this.MarkersService.markerMouseoutTimeout);
                    }
                  }
                  */
                  this.CommunitiesService.getCommunityById(this.markerData.id)
                    .then(function(community) {
                      $timeout(
                        function() {
                          this.community.isMarkerHovered = true;
                        }.bind({community: community}), 0
                      );
                    })
                  ;

  	            }
  	            .bind({
  	              MarkersService: this,
  	              CommunitiesService: CommunitiesService,
  	              markerData: markerData
  	            })
	            );
	            marker.addListener('mouseout', 
            	  function(event) {
                  this.MarkersService.ungrowMarkerByCommunityId(parseInt(this.markerData.id, 10));
                  if (BrowserDetectionService.isIE) {return;}
                  this.MarkersService.markerMouseoutTimeout =
                    $timeout(function() {
                      this.CommunitiesService.getCommunityById(this.markerData.id)
                        .then(function(community) {
                          $timeout(
                            function() {
                              this.community.isMarkerHovered = false;
                            }.bind({community: community}), 0
                          );
                        })
                      ;
                    }.bind(this), BrowserDetectionService.isIE ? 20 : 0)
                  ;
  	            }
  	            .bind({
  	              MarkersService: this,
  	              CommunitiesService: CommunitiesService,
  	              markerData: markerData
  	            })
	            );
	            
	            // marker event listeners in general (debugging)
	            // https://developers.google.com/maps/documentation/javascript/reference#Marker
	            /*
	            marker.addListener('visible_changed', function(event) { console.log('marker visible_changed, event: ', event); });
	            marker.addListener('zindex_changed', function(event) { console.log('marker zindex_changed, event: ', event); });
	            marker.addListener('icon_changed', function(event) { console.log('marker icon_changed, event: ', event); });
	            marker.addListener('map_changed', function(event) { console.log('marker map_changed, event: ', event); });
	            */
	            
          	} // end for loop
          	
	          // retain a handle/pointer to the infoWindow for closing all window, debugging etc.
	          this.setting('_infoWindows').push(infowindow);
	          
				  } // end for (var key in $scope.dummyMarkersData)
  	       
  	      /*
	        timers.totalMarkers.end = window.performance.now();
          timers.totalMarkers.timeElapsed = timers.totalMarkers.end - timers.totalMarkers.start;
          console.log('buildInfoWindowMarkers performance timers: ', timers);
          */
        },        
        
      
				
				// close all open info windows
				
				closeAllInfoWindows : function()
				{
				  for ( var key in this.infoWindowCache.cached ) {
				    var infowindow = this.infoWindowCache.cached[key];
				    infowindow.isInfoWindowOpen = false;
				    infowindow.close();
				  }
				},
				
        bindMarkersToMap : function()
        {
          window.getGlobalGoogleMaps.then(function() {
            for ( var key in this.setting('markers') ) {
              var marker = this.setting('markers')[key];
              marker.setMap(this.setting('map'));
            }
          }.bind(this));
        },
        
        redrawCurrentInfoWindow : function()
        {
          var infoWindow  = this.setting('currentInfoWindow');
          if (infoWindow === null) {return;}
          if (infoWindow.isInfoWindowOpen) {
            this.closeCurrentInfoWindow();
            this.openCurrentInfoWindow();  
          }
        },
        openCurrentInfoWindow : function()
        {
          var infoWindow  = this.setting('currentInfoWindow');
          var marker      = this.setting('currentInfoWindowMarker');
          var map         = this.setting('map');
          if (infoWindow !== null) {
            infoWindow.open(map, marker);
          }
        },
        closeCurrentInfoWindow : function()
        {
          var infoWindow  = this.setting('currentInfoWindow');
          if (infoWindow !== null) {
            infoWindow.close();
          }
        },
        openInfoWindowByCommunityId : function(id, options)
        {
          var defaults = {
            'panTo'   : false,
            'center'  : false,
            'offsetx' : 0,
            'offsety' : 0,
          };
          var settings = angular.extend(defaults, options);

          var infowindow  = this.getInfoWindowByCommunityId(id);
          var marker      = this.getMarkerByCommunityId(id);
          CommunitiesService.getCommunityById(id)
            .then(
              function(community){
                var latlng = {
                  lat: community.lat,
                  lng: community.lng
                };
                
                // adjusted to accommodate our map overlay
                var adjustedLatLng = 
                  this.MarkersService.offsetLatLng(
                    latlng, 
                    this.settings.offsetx, 
                    this.settings.offsety
                  )
                ;
                // window.adjustedLatlng = adjustedLatLng;
                // console.log('latlng: ', latlng);
                // console.log('adjustedLatlng: ', adjustedLatLng);
                if (this.settings.center && this.MarkersService.settings.map) {
                  this.MarkersService.settings.map.setCenter(adjustedLatLng);
                }
                if (this.settings.panTo && this.MarkersService.settings.map) {
                  this.MarkersService.settings.map.panTo(adjustedLatLng);
                }
                if (this.infowindow !== null && this.infowindow !== undefined) {
                  if (!this.infowindow.isInfoWindowOpen) {
                    var clickEventName = BrowserDetectionService.isIE ? 'mousedown' : 'click';
                    google.maps.event.trigger(this.marker, clickEventName);
                  }
                } else {
                  console.log('infowindow is missing');
                }

              }.bind({
                MarkersService: this,
                infowindow: infowindow,
                marker:     marker,
                settings:   settings
              })
            )
          ;
          
        },
        closeInfoWindowByCommunityId : function(id)
        {
          var infowindow = this.getInfoWindowByCommunityId(id);
          infowindow.close();
        },
        getMarkerByCommunityId : function(id)
        {
          var marker = this.markerCache.get(id);
          return marker;
        },
        getInfoWindowByCommunityId: function(id)
        {
          var infowindow = this.infoWindowCache.get(id);
          return infowindow;
        },
        getIndexByCommunityId: function(id) 
        {
          id = id.toString();
          var index = null;
          for (var key in this.settings.markersData) {
            var markerData = this.settings.markersData[key];
            if (markerData.id === id) {index = key;}
          }
          return index;
        },

        growMarkerByCommunityId: function(id)
        {
          var marker = this.getMarkerByCommunityId(id);
          // console.log('MarkersService.growMarkerByCommunityId id: ', id, ' marker: ', marker);
          if (marker === null 
           || marker === undefined 
           || marker.map === null 
           || marker.map === undefined
          ) {return;}
          marker.set( 'icon', angular.extend({}, marker.icon, AppConfig.MarkersService.hoverMarkerIcon) );
          var zindex = marker.getZIndex();
          if (zindex < 10000) {
            marker.setZIndex(zindex + 10000);
          }
          marker.setLabel( angular.extend({}, marker.label, AppConfig.MarkersService.hoverMarkerLabel) );
        },
        ungrowMarkerByCommunityId: function(id)
        {
          var marker = this.getMarkerByCommunityId(id);
          // console.log('MarkersService.ungrowMarkerByCommunityId id: ', id, ' marker: ', marker);
          if (marker === null 
           || marker === undefined 
           || marker.map === null 
           || marker.map === undefined
          ) {return;}
          marker.set( 'icon', angular.extend({}, marker.icon, AppConfig.MarkersService.markerIcon) );
          var zindex = marker.getZIndex();
          if (zindex >= 10000) {
            marker.setZIndex( zindex - 10000);
          }
          marker.setLabel( angular.extend({}, marker.label, AppConfig.MarkersService.markerLabel) );
        },
        
        redrawLabelForCommunities : function(communities)
        {
          for (var key in communities) {
            var community = communities[key];
            this.redrawLabelForCommunity(community);
          }
        },
        redrawLabelForCommunity: function(community)
        {
          var marker = this.getMarkerByCommunityId(community.id);
          if (marker !== null) {
            var labelContent  = community.filterRanking 
				                          ? community.filterRanking.toString() 
				                          : community.id
				                            ? community.id.toString()
				                        : '-'
				    ;
				    var labelClass    = labelContent.length > 2
				                        ? 'map-marker-label-lg'
				                      : labelContent.length > 1
				                        ? 'map-marker-label-md'
				                      : 'map-marker-label-sm'
				    ;


            marker.set('map', this.setting('map'));
            marker.label.text = labelContent;
            marker.setLabel(marker.getLabel());
          } else {
            // console.log('marker is null for community: ', community);
          }
          
        },
        
        // http://stackoverflow.com/questions/10656743/how-to-offset-the-center-point-in-google-maps-api-v3
        offsetLatLng: function(latlngLiteral,offsetx,offsety) 
        {
          latlngLiteral.lat = parseFloat(latlngLiteral.lat);
          latlngLiteral.lng = parseFloat(latlngLiteral.lng);
          
          if (offsetx === undefined || offsetx === null) {offsetx = 0;} 
          if (offsety === undefined || offsety === null) {offsety = 0;} 
          
          var latlng = new google.maps.LatLng(latlngLiteral);
          // latlng is the apparent centre-point
          // offsetx is the distance you want that point to move to the right, in pixels
          // offsety is the distance you want that point to move upwards, in pixels
          // offset can be negative
          
          var scale = Math.pow(2, this.settings.map.getZoom());
          var nw = new google.maps.LatLng(
              this.settings.map.getBounds().getNorthEast().lat(),
              this.settings.map.getBounds().getSouthWest().lng()
          );
          
          var worldCoordinateCenter = this.settings.map.getProjection().fromLatLngToPoint(latlng);
          var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0)
          
          var worldCoordinateNewCenter = new google.maps.Point(
              worldCoordinateCenter.x - pixelOffset.x,
              worldCoordinateCenter.y + pixelOffset.y
          );
          
          var newLatLng = this.settings.map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
          
          return newLatLng;
          
        }
        
        
        
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

