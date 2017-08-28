/* globals angular */

/**
 * @brief   Dummy Data Service
 * @author  James Earlywine - <james.earlywine@indystar.com>
 */
angular.module('DummyDataService', [
    
  ])
  .factory('DummyDataService', [
      'AppConfig',
    function(
      AppConfig
    ) {
      
      return {

          communities: {
			  
    			  '5' : 
      			  {
      			    id          : 5,
      			    //lat         : 39.7715631,
      			    //lng         : -86.1561108,
      			    lat         : 39.7724719,
      			    lng         : -86.1557456,
      			    name        : 'OldIndystar',
      			    address1		: '307 N. Pennsylvania Ave',
      			    address2		: null,
      			    city				: 'Indianapolis',
      			    state				: 'IN',
      			    zip					: '46204',
      			    phone				: '317-444-4444',
      			    email				: 'info@indystar.com',
      			    website     : 'indystar.com',
                isEnhanced  : false,
                isFavorited : false,
      			  },
      			'55' :
        			{
      			    id          : 55,
      			    lat         : 39.7647171,
      			    lng         : -86.1585525,
      			    name        : 'Indystar',
      			    address1		: '130 S. Meridian St',
      			    address2		: null,
      			    city				: 'Indianapolis',
      			    state				: 'IN',
      			    zip					: '46225',
      			    phone				: '317-444-7032',
      					email				: 'james.earlywine@indystar.com',
      					website     : 'indystar.com',
      			    isEnhanced  : false,
      			    isFavorited : true
        		  },
        		'555' :
      			  {
      			    id          : 555,
      			    lat         : 39.8050568,
      			    lng         : -86.15597489999999,
      			    name        : "The Marrott",
      			    // name        : null,
      			    address1		: '2625 N. Meridian St',
      			    address2		: null,
      			    city				: 'Indianapolis',
      			    state				: 'IN',
      			    zip					: '46208',
      			    phone				: '317-918-5861',
      			    email				: 'james@esilogix.com',
      			    website     : 'http://vanrooy.com/marott',
      			    isEnhanced  : true,
      			    isFavorited : false
      			  },
    			  
    		  }, // end communities

        
      }; // end return
      
    } // end function
  ]) // end service factory 
; // end angular module

