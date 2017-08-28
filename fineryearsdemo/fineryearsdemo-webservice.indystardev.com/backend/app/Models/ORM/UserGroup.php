<?php
namespace App\Models\ORM;

class UserGroup extends \Eloquent {

    public      $table      = 'groups';
    public      $timestamps = true;
    
    protected   $hidden     = array('password');
    

    public function users() {
        return $this->belongsToMany (   'App\User', 
                                        'users_groups', 
                                        'group_id', 
                                        'user_id'
                                    );
    }
    
}
