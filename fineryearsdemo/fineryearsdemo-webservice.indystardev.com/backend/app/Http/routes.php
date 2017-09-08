<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', 'HomeController@index');
Route::auth();
Route::get('cmslogout', [
    'as' => 'cmslogout', function() {
      return Redirect::to('logout');
    }
]);

/**
 * RESTful resource controllers
 */
Route::group(['middleware' => ['cors']], function() {
  Route::resource('community', 'CommunityController',                 ['only' => ['index', 'show'] ]);
  Route::resource('communityCategory', 'CommunityCategoryController', ['only' => ['index'] ]);
  Route::resource('region', 'RegionController',                       ['only' => ['index'] ]);
  Route::resource('amenity', 'CommunityAmenityController',            ['only' => ['index'] ]);
});

/**
 * Community Submissions (advertise with us)
 */
Route::group(['middleware' => ['cors']], function() {
  Route::post('communitySubmission',               'CommunityController@submission');
  Route::get( 'communityByEnhancedUpdateApiKey',   'CommunityController@getCommunityByEnhancedUpdateApiKey');
  Route::put( 'communityEnhancedUpdateSubmission', 'CommunityController@enhancedUpdateSubmission');
});

/**
 * Community misc.
 */
Route::group(['middleware' => ['cors']], function() {
  Route::get('communityCitiesAndZips',              'CommunityController@getCitiesAndZips');
});

/**
 * Email previews
 */
Route::group(['prefix' => 'emails', 'middleware' => ['cors']], function() {
  
  // previews for dev testing
  Route::get('communitySubmissionConfirmation/{communityId}',       'EmailController@communitySubmissionConfirmationPreview');
  Route::get('communitySubmissionAdminNotification/{communityId}',  'EmailController@communitySubmissionAdminNotificationPreview');
  Route::get('communityUpdateConfirmation/{communityId}',           'EmailController@communityUpdateConfirmationPreview');
  Route::get('communityRequestMoreInformation/{communityId}',       'EmailController@communityRequestMoreInformationPreview');
  
  // production endpoint - request for more information
  Route::post('communityRequestMoreInformation/{communityId}',       'EmailController@communityRequestMoreInformation');
  // production endpoint - view image proxy
  Route::get('viewImage',                                           'EmailController@viewImage');
  
});

/**
 * Guest Auth & Saving
 */
Route::group([ 'prefix' => 'guest', 'middleware' => ['cors'] ], function() {
  
  Route::group(['prefix' => 'auth'], function() {
    Route::get('whoami',                'GuestController@whoami');
    Route::get('exists/{email}',        'GuestController@exists');
    Route::get('register/{email}',      'GuestController@register');
    Route::get('login/{email}',         'GuestController@login' );
    Route::get('registerLogin/{email}', 'GuestController@registerLogin');
    Route::get('logout',                'GuestController@logout');
  });
  
  Route::post(  'favorites',      'FavoritesController@addFavorites');
  Route::put(   'favorites',      'FavoritesController@setFavorites');
  Route::delete('favorites',      'FavoritesController@removeFavorites');
  
});

/**
 * Demo-Related
 */
Route::group([ 'prefix' => 'demo', 'middleware' => ['cors', 'auth'] ], function() {
  
  Route::group(['prefix' => 'reset'], function() {
    Route::get('database',              [
      'as' => 'demoResetDatabase',
      'uses' => 'DemoController@postResetDatabase'
    ]);
  });
  
});


/**
 * Action Tracking
 *
  Route::post('actionTracking', 
    ['middleware' => ['cors'], 'uses' => 'ActionTrackingController@postRecordAction']
  );
*/
/**
 * Downloads
 */
Route::get('downloads/informationRequests.csv', 
  ['middleware' => ['auth', 'cors'], 
   'as'   => 'informationRequests.csv',
   'uses' => 'DownloadsController@getInformationRequestsCSV'
  ]
);


/**
 * Testing
 *
Route::post('requestResponse', 
  ['uses' => 'TestingController@requestResponse']
);
Route::put('requestResponse', 
  ['uses' => 'TestingController@requestResponse']
);
Route::get('session', 'TestingController@getSession');
Route::get('cookies', 'TestingController@getCookies');
Route::get('test/query', 'TestingController@testQuery');
*/