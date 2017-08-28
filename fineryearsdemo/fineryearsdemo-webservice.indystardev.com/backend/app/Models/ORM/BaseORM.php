<?php namespace App\Models\ORM;

use Illuminate\Database\Eloquent\Model;

class BaseORM extends Model {
  
  
    public function getTableName() 
    {
        return $this->table;
    }

    public static function instance() {
        return new static();
    }

}