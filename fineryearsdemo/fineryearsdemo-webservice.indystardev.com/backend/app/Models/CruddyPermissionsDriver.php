<?php
namespace App\Models;

use Kalnoy\Cruddy\Contracts\Permissions;
use Kalnoy\Cruddy\BaseForm;
use Illuminate\Support\Facades\Auth;

class CruddyPermissionsDriver implements Permissions {
  
  
  
    /**
     * Get whether a user is allowed to perform an action on entity.
     *
     * @param string $action
     * @param BaseForm $entity
     *
     * @return bool
     */
    public function isPermitted($action, BaseForm $entity)
    {
        $key          = "{$entity->getId()}.{$action}";
        $user         = Auth::user();
        
        return ( !is_null($user) && $user->hasKey($key) );
    }

  
}