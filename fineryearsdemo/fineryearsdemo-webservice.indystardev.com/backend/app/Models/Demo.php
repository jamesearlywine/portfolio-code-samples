<?php namespace App\Models;

use App\Models\Utils\MySQL;
class Demo {
  
  public static function resetDatabase()
  {
    return Mysql::executeSQLFile( storage_path('db/TheFinerYearsDemo_reset.sql') );
  }
  
  
}

?>