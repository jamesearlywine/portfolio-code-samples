<?php namespace App\Models\ORM;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;

class GuestUser extends BaseORM {

    public $timestamps  = false;

	protected $table    = 'guest_users'; 
    protected $guarded  = [];
    protected $hidden   = [
        'pivot',
        //'id'
    ];

    protected $with     = [
        'favoriteCommunities'
    ];

    public static $updateS3OnSave = false;
    
    /**
     * Event registration
     */
    public static function boot()
    {
        parent::boot();
        static::saving(function($model) {
            static::cleanData($model);
            if (static::$updateS3OnSave) {
                // ..
            }
        });
        static::saved(function($model) {
            if (static::$updateS3OnSave) {
                //static::generateApiCache();
            }
        });
        static::deleted(function($model) {
            if (static::$updateS3OnSave) {
                //static::generateApiCache();
            }
        });
    }
        
    /**
     * Relations
     */
    public function favoriteCommunities()     { return $this->belongsToMany('App\Models\ORM\Community', 'guest_user_favorite_communities'); }

    /**
     * Favoriting
     */
    public function addFavorites($communityIDs)
    {
        if (!is_array($communityIDs)) {$communityIDs = [$communityIDs];}
        foreach ($communityIDs as $communityID) { $this->addFavorite($communityID); }
        $this->save();
        static::refreshSession();
    }
    protected function addFavorite($communityID)
    {
        $community = Community::find($communityID);
        if ( !empty($community) 
          && $this->favoriteCommunities()->where('id', $communityID)->count() < 1 )  
        {
            $this->favoriteCommunities()->attach($community);
        }
    }
    public function removeFavorites($communityIDs)
    {
        if (!is_array($communityIDs)) {$communityIDs = [$communityIDs];}
        foreach ($communityIDs as $communityID) { $this->removeFavorite($communityID); }
        $this->save();
        static::refreshSession();
    }
    protected function removeFavorite($communityID)
    {
        $community = Community::find($communityID);
        if (!empty($community)
         && $this->favoriteCommunities()->where('id', $communityID)->count() > 0
        ) {
            $this->favoriteCommunities()->detach($community);
        }
    }
    public function setFavorites($communityIDs)
    {
        $this->clearFavorites();
        usleep(500000);
        $this->addFavorites($communityIDs);
    }
    public function clearFavorites()
    {
        $this->favoriteCommunities()->detach();
        $this->save();
    }
    


    /**
     * Guest Auth
     */
     
    /**
     * @brief   What GuestUser am I currently identified as?
     */
    public static function whoami()
    {
        return Session::get('GuestUser');
    }
    public static function refreshSession()
    {
        $user = Session::get('GuestUser');
        if (!is_null($user)) {
            static::login($user['email']);
        } else {
            static::logout($user['email']);
        }
    }
    /**
     * @brief   Check to see if a GuestUser exsts (by email)
     */
    public static function exists($email)
    {
        return static::where('email', $email)->count() > 0;
    }

    /**
     * @brief   Register a GuestUser (only email is required)
     */
    public static function register($email)
    {
        if (!static::exists($email)) {
            return static::create(['email' => $email]);
        } else {
            return null;
        }
    }

    /**
     * @brief   Login a GuestUser (only email is required)
     */
    public static function login($email)
    {
        $guestUser = static::where('email', $email)->first();
        if (!empty($guestUser)) {
            $guestUser = $guestUser->toArray();
        } else {
            return null;
        }
        if (!empty($guestUser)) {
            Session::forget('GuestUser');
            Session::put('GuestUser', $guestUser);
        }
        return $guestUser;
    }

    /**
     * @brief   Logout a GuestUser (only email is required)
     */
    public static function logout()
    {
        Session::flush();
        Session::forget('GuestUser');
        return Session::put('GuestUser', null);
    }


    /**
     * toArray adjustments
     */
    public function toArray()
    {
        $arrData = parent::toArray();
        
        // reduce favorite_communities to community IDs
        $favorite_communities_IDs = [];
        foreach ($arrData['favorite_communities'] as $community) {
            array_push($favorite_communities_IDs, $community['id']);
        }
        $arrData['favorite_communities'] = $favorite_communities_IDs;
        
        return $arrData;
    }
    
    public static function cleanData()
    {
        // ..
    }


    
}


