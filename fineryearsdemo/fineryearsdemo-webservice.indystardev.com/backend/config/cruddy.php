<?php return array(

    // The title of the application. It can be a translation key.
    'brand' => 'The Finer Years - Admin CMS',

    // The link to the main page
    'brand_url' => '/admincms',

    // The name of the view that is used to render the dashboard.
    // You can specify an entity id prefixing it with `@` like so: `@users`.
    'dashboard' => 'cruddy::dashboard',

    // The URI that is prefixed to all routes of Cruddy.
    'uri' => 'admincms',
    
    // for when your backend is hosted in a subfolder - for generating client-side CRUD-routes dynamically as the user clicks items
    'uri_prefix' => env('CRUDDY_URI_PREFIX', ''),
    
    'loginUrl' => env('CRUDDY_LOGIN_URL', ''),
    
    'useDateTimePicker' => true,
    'dateTimePickerOptions' => [
        'inline'        => true,
        'sideBySide'    => true,
        'format'        => 'YYYY-MM-DD HH:mm:ss',
        'keepOpen'      => true    
    ],
    
    // close the record editor after a save?
    'closeAfterSave' => true,
    
    // The class name of permissions driver.
    //'permissions' => 'Kalnoy\Cruddy\Service\PermitsEverything',
    'permissions'   => 'App\Models\CruddyPermissionsDriver',

    // The middleware that wraps every request to Cruddy. Can be used for authentication.
    'middleware' => ['web', 'auth'],

    // Main menu items.
    //
    // How to define menu items: https://github.com/lazychaser/cruddy/wiki/Menu
    'menu' => [
        //[ 'entity' => 'community_galleries',         'label' => 'Community Galleries' ],
        //[ 'entity' => 'community_gallery_images',    'label' => 'Community Gallery Images' ],
        [ 'entity' => 'communities',                'label' => 'Communities' ],
        [ 'entity' => 'users',                      'label' => 'Users' ],
        [ 'entity' => 'groups',                     'label' => 'UserGroups' ],
        [ 'entity' => 'community_amenities',        'label' => 'Amenities' ],
        [ 'entity' => 'community_ads',              'label' => 'CommunityAds' ],
        //[ 'entity' => 'community_category_memberships',         'label' => 'CategoryMemberships' ],
        //[ 'entity' => 'community_categories',         'label' => 'Categories' ],
        
    ],

    // The menu that is displayed to the right of the main menu.
    'service_menu' => [
        ['label' => 'informationRequests.csv', 'route' => 'informationRequests.csv'],
        ['label' => 'Logout', 'route' => 'cmslogout' ],
        
    ],

    // The list of key value pairs where key is the entity id and value is
    // an entity class name. For example:
    //
    // 'users' => 'App\Entities\User'
    //
    // Class is resolved out of IoC container.
    'entities' => [
        /*
        'games'         => App\Entities\Game::class,
        'periodlabels'  => App\Entities\PeriodLabel::class,
        */
        'communities'                       => App\Entities\Community::class,
        'community_galleries'               => App\Entities\CommunityGallery::class,
        'community_gallery_images'          => App\Entities\CommunityGalleryImage::class,
        'community_amenities'               => App\Entities\CommunityAmenity::class,
        'community_category_memberships'    => App\Entities\CommunityCategoryMembership::class,
        'community_categories'              => App\Entities\CommunityCategory::class,
        'community_ads'                     => App\Entities\CommunityAd::class,
        'regions'                           => App\Entities\Region::class,
        
        'users'                 => App\Entities\User::class,
        'groups'                => App\Entities\UserGroup::class
        
    ],
);