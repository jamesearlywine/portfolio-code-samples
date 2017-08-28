<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];
    
    protected $with = [
        'groups'    
    ];
    
    /**
     * Relations
     */
    public function groups() {

        return $this->belongsToMany (   'App\Models\ORM\UserGroup', 
                                        'users_groups', 
                                        'user_id', 
                                        'group_id'
                                    )
        ;
        
    }
    
    /**
     * toArray override
     */
     public function toArray() 
     {
       $this->hasKey('blah'); // initialize permissions
       return parent::toArray();
     }
    
    /**
     * @brief   Permissions
     * @note    Required by Permissions Driver to work with Auth::user (to avoid Sentry dependency)
     */
     public static $defaultPermission   = false;
     public static $permissions = [];
     public function hasKey($key)
     {
         // build the user permissions array (only once)
         if (is_null($this->permissions)) { $this->permissions = static::cruddyBuildPermissions($this); }
         // if the permissions hasn't been set for this user, return the default permissions
         if (!isset($this->permissions[$key])) { return static::$defaultPermission; }
         // otherwise return the permission for this user
         return (bool) $this->permissions[$key];
     }
     protected static function cruddyBuildPermissions($user)
     {
        $groupLevelPermissions  = (!is_null($user->groups))
                                ? static::cruddyBuildGroupPermissions($user->groups)
                                : []
        ;
        return $groupLevelPermissions;
     }
     protected static function cruddyBuildGroupPermissions($groups)
     {
         $groupPermissions = [];
         foreach ($groups as $group) {
             foreach(json_decode($group->permissions) as $permission => $granted) {
                 // if the permission has already been granted, skip
                 if (isset($groupPermissions[$permission])
                  && $groupPermissions[$permission]
                 ) {continue;}
                 // otherwise, update group permissions
                 $groupPermissions[$permission] = $granted;
             }
         }
         return $groupPermissions;
     }
}
