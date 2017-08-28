/* globals angular */

/**
 * @brief   Simple Sort service
 * @author  James Earlywine - <james.earlywine@indystar.com>
 */
angular.module('SortService', [
    'ngLodash'
  ])
  .factory('SortService', [
      'lodash',
      'AppConfig',
    function(
      _,
      AppConfig
    ) {
      
      return {
        
        settings : {
          defaults: {
            // sort params
            sortParamsByDataType : {
              
              communities: {
                // fields can be the name of the field, or an iteratee function
                fields: [
                  'isEnhanced',
                  function(obj) {return obj.name.toLowerCase();} // case insensitive sorting by name
                ],
                // applied to fields in same order
                orderBys: [
                  'desc',   // isEnhanced === true first
                  'asc'     // sort on community.name A-Z
                ]
              }, // end communities sortParams
              
              
            } // end sortParams
            
          } // end defaults
        }, // end settings
        
        sort : function(dataType, arrData, sortParams)
        {
          sortParams  = sortParams || this.settings.defaults.sortParamsByDataType[dataType];
          var sorted = _.orderBy(arrData, sortParams.fields, sortParams.orderBys);
          return sorted;
        },
        

        
        
        
        
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

