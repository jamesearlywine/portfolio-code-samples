/* globals angular */

/**
 * @brief   Filter service
 * @author  James Earlywine - <james.earlywine@indystar.com>
 */
angular.module('FilterService', [
    'ngLodash'
  ])
  .factory('FilterService', [
      'lodash',
      'AppConfig',
    function(
      _,
      AppConfig
    ) {
      
      var service = {
        
        settings : {
          defaults: {
            // default filter settings for communities
            communities: {
              filterIsCustom: false,
              regions: {
                'all' : true,   // all regions
                    1 : false,  // North
                    2 : false,  // South
                    3 : false,  // East
                    4 : false,  // West
                    5 : false,  // Inner I-65
              },
              category_memberships: {
                'all' : true,   // all care types
                    1 : false,  // Limited Maintenance/Maintenance Free
                    2 : false,  // Independent Living
                    3 : false,  // Continuing Care Retirement Communities
                    4 : false,  // Assisted Living
                    5 : false,  // Home Care
                    6 : false,  // On-Site Home Care
                    7 : false,  // Respite Care
                    8 : false,  // Memory Care
                    9 : false,  // Rehabilitiation Care
                   10 : false,  // Nursing / Specialty Care
              },
              cityOrZip: null,
              decorateWithFilterRanking: true
            }
          },
        }, // end settings
        
        /**
         * @brief Service initialization
         */
        init : function() 
        {
          // console.log('initializing filter service');
          // settings
          
          // communities
          this.settings.communities = {};
          // regions
          this.initRegions();
          // category_memberships
          this.initCategories();
          // cityOrZip
          this.initCityOrZip();
          this.settings.communities.isCustomFilter = false;
          
          
        },
        initRegions : function()
        {
          // console.log('FilterService.initRegions()');
          this.settings.communities.regions = {};
          angular.extend(this.settings.communities.regions, this.settings.defaults.communities.regions);
        },
        initCategories: function()
        {
          // console.log('FilterService.initCategories()');
          this.settings.communities.category_memberships = {};
          angular.extend(this.settings.communities.category_memberships, this.settings.defaults.communities.category_memberships);
        },
        initCityOrZip : function()
        {
          // console.log('FilterService.initCityOrZip()');
          this.settings.communities.cityOrZip = this.settings.defaults.communities.cityOrZip;
        },


        /**
         * @brief Filter communities (based upon settings.communities)
         */
        filter_communities : function(arrData, decorate) 
        {
          decorate = decorate || this.settings.defaults.communities.decorateWithFilterRanking;
          var out = _.filter(arrData, this.community_filter.bind(this));
          if (decorate) { 
            this.decorateWithFilterRanking(out); 
          }
          return out;
        },
        /**
         * Returns true if community matches filter criteria, false if not
         */
        community_filter : function(community)
        {
          // filter logic/checking here..
          
          // if not approved, exclude from filtered results
          if (community.isApproved === false) {return false;}
          
          // region
          var regionTestPassed = false;
          if (this.settings.communities.regions['all']) {
            regionTestPassed = true;
          } else {
            var regionIDs = _.transform(this.settings.communities.regions, 
                                          function(result, value, key) {
                                            (result[value] || (result[value] = [])).push(key);
                                          }
                                        )
                            .true
            ;
            
            var communityRegionIDs  = _.map(community.regions, 'id');
            if (!regionIDs || regionIDs.length === 0) {
              regionTestPassed =  ( 
                   this.settings.communities.cityOrZip === null 
                || this.settings.communities.cityOrZip === undefined
                || this.settings.communities.cityOrZip.trim() === ''
              );
            } else {
              regionTestPassed    = _.differenceWith(
                  regionIDs, 
                  communityRegionIDs, 
                  function(t1, t2) {
                    return parseInt(t1, 10) == parseInt(t2, 10);
                  }
                ).length !== regionIDs.length
              ;  
            }
          } // end regions test
          
          // cityOrZip
          var cityOrZipTestPassed = false;
          if (this.settings.communities.cityOrZip 
           && this.settings.communities.cityOrZip.trim() !== ''
          ) 
          {
            
            if (community.city && community.city.trim() !== '') {
              if (community.city.toLowerCase()
                  .indexOf( this.settings.communities.cityOrZip.toLowerCase() )
                  !== -1
              ) {
                cityOrZipTestPassed = true;
              }
            }
            if (community.zip && community.zip.toString().trim() !== '') {
              if (community.zip.toString().toLowerCase()
                  .indexOf( this.settings.communities.cityOrZip.toLowerCase() )
                  !== -1
              ) {
                cityOrZipTestPassed = true;
              }
            }
          } // end cityOrZip test
          
          // category_memberships (care type)
          var categoryMembershipTestPassed = false;
          if (this.settings.communities.category_memberships['all']) {
            categoryMembershipTestPassed = true;
          } else {
            var categoryIDs = _.transform(this.settings.communities.category_memberships, 
                                          function(result, value, key) {
                                            (result[value] || (result[value] = [])).push(key);
                                          }
                                        )
                            .true
            ;
            if (!categoryIDs || categoryIDs.length === 0) {
              categoryMembershipTestPassed = true;
            } else {
              var communityCategoryIDs  = _.map(community.category_memberships, 'category.id');
              var categoryMembershipTestPassed    = _.differenceWith(
                  categoryIDs, 
                  communityCategoryIDs, 
                  function(t1, t2) {
                    return parseInt(t1, 10) == parseInt(t2, 10);
                  }
                ).length !== categoryIDs.length
              ;  
            }
          } // end cateogry_memberships test

          var filterTestPassed  = (this.settings.communities.cityOrZip !== null
                                && this.settings.communities.cityOrZip !== undefined
                                && this.settings.communities.cityOrZip.trim() !== '')
                                ? (cityOrZipTestPassed && categoryMembershipTestPassed)
                                : (regionTestPassed && categoryMembershipTestPassed)
          ;
          return filterTestPassed;
        },
        
        
        
        
        /**
         * @brief   Decorates an array of objects with .ranking property
         */
        decorateWithFilterRanking : function(arrData)
        {
          for (var key in arrData) {
            if (arrData[key]) {
              arrData[key].filterRanking = parseInt(key, 10) + 1;
            }
          }
          return arrData
        },
        


        /**
         * Clickable CareTypes and Regoins (for Results Summary)
         */
        // comma-separated list of clickable care-types
        clickableCareTypesByCategoryId : {
        'all': {  'careTypeName'  : 'All Types',
                  'careType'      : null,
                  'id'            : 'all'
            },
            1: {  'careTypeName'  : 'Limited Maintenance / Maintenance Free',
                  'careType'      : 'maintenanceFree',
                  'id'            : 1
            },
            2: {  'careTypeName'  : 'Independent Living',
                  'careType'      : 'independentLiving',
                  'id'            : 2
            },
            3: {  'careTypeName'  : 'Continuing Care Retirement Communities',
                  'careType'      : 'ccrc',
                  'id'            : 3
            },
            4: {  'careTypeName'  : 'Assisted Living',
                  'careType'      : 'assistedLiving',
                  'id'            : 4
            },
            5: {  'careTypeName'  : 'Home Care',
                  'careType'      : 'homeCare',
                  'id'            : 5
            },
            6: {  'careTypeName'  : 'On-Site Home Care',
                  'careType'      : 'onSiteHomeCare',
                  'id'            : 6
            },
            7: {  'careTypeName'  : 'Respite Care',
                  'careType'      : 'respiteCare',
                  'id'            : 7
            },
            8: {  'careTypeName'  : 'Memory Care',
                  'careType'      : 'memoryCare',
                  'id'            : 8
            },
            9: {  'careTypeName'  : 'Rehabilitiation Care',
                  'careType'      : 'rehab',
                  'id'            : 9
            },
            10: { 'careTypeName'  : 'Nursing / Specialty Care',
                  'careType'      : 'nursingCare',
                  'id'            : 10
            }
        },
        clickableRegionsById : {
          'all' : 'All Regions',
            1: 'North',
            2: 'South',
            3: 'East',
            4: 'West', 
            5: 'Inner I-465'
        },
        updateClickables : function()
        {
            this.updateClickableCareTypes();
            this.updateClickableRegions();
            this.updateClickableCityOrZip();
        },
        clickableCareTypes : [],
        updateClickableCareTypes : function()
        {
          this.clickableCareTypes = [];
          var categoryIDs = _.transform(this.settings.communities.category_memberships, 
                                        function(result, value, key) {
                                          (result[value] || (result[value] = [])).push(key);
                                        }
                                      )
                            .true
          ;
          var hasAll = false;
          _.forEach(categoryIDs, function(categoryID) {
            if (categoryID === 'all') {hasAll = true;}
            this.clickableCareTypes.push(
              this.clickableCareTypesByCategoryId[categoryID]
            );
          }.bind(this));
          if (hasAll) { this.clickableCareTypes = []; }
          if (this.clickableCareTypes.length < 1) {
            this.clickableCareTypes.push(
              this.clickableCareTypesByCategoryId['all']
            );
          }
          
        },
        clickableRegions : [],
        updateClickableRegions : function() 
        {
          this.clickableRegions = [];
          var regionIDs = _.transform(this.settings.communities.regions, 
                                      function(result, value, key) {
                                        (result[value] || (result[value] = [])).push(key);
                                      }
                                    )
                          .true
          ;
          
          var hasAll = false;
          _.forEach(regionIDs, function(regionID) {
            if (regionID === 'all') {hasAll = true;}
            this.clickableRegions.push({
              id          : regionID,
              regionName  : this.clickableRegionsById[regionID]
            });
          }.bind(this));
          if (hasAll) { this.clickableRegions = []; }
          if (this.clickableRegions.length < 1) {
            this.clickableRegions.push({
              id          : 'all', 
              regionName  : this.clickableRegionsById['all']
            });
          }
        },
        clickableCityOrZip: null,
        updateClickableCityOrZip : function()
        {
          this.clickableCityOrZip = (
              this.settings.communities.cityOrZip === undefined
           || this.settings.communities.cityOrZip === null
           || this.settings.communities.cityOrZip.trim() === ''
          )
            ? null
            : this.settings.communities.cityOrZip
          ;
        },
        getClickables : function() 
        {
          this.updateClickables();
          return {
            careTypes : this.clickableCareTypes,
            regions   : this.clickableRegions,
            cityOrZip : this.clickableCityOrZip
          };
        },
        
        clearCommunitiesRegionsSettings : function()
        {
          this.settings.communities.regions = {
            'all' : false,   // all regions
                1 : false,  // North
                2 : false,  // South
                3 : false,  // East
                4 : false,  // West
                5 : false,  // Inner I-65
          };
        }
        
        
        
      }; // end service
      
      service.init();
      
      return service;
      
    } // end function
  ]) // end service factory

; // end angular module

