<?php
namespace App\Models\Utils;

use App\Models\Utils\Random;
use Carbon\Carbon;
use stdClass;

class FilenameGenerator {
  
  public static function random($charLimit = 8, $useTimestamp = true, $extension = null) 
  {
    $timestamp  = $useTimestamp 
                ? time() . '_'
                : ''
    ;
    $random = Random::chars([
        'numChars' => $charLimit
    ]);
    
    $filename = $timestamp . $random;
    
    if (!is_null($extension)) {
      $filename = $filename . '.' . $extension;
    }
    
    return $filename;
  }
  
  
  
}