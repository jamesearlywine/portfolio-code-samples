<?php
namespace App\Models\Utils;

use \Exception;

class Filter {
    
    public static function objectsByKeyword($arrObjs, $arrProperties, $keywordFilter = null, $requireAll = false)
    {
        if ($keywordFilter === null || trim($keywordFilter) === '') {return $arrObjs;}
        if ( count($arrProperties) === 1 && trim($arrProperties[0] === '')  
          || empty($arrProperties)
        ) { return $arrObjs; }
        
        $keywords = explode('|', $keywordFilter);
        $keywords = array_map('trim', $keywords);
        
        $requiredNumMatches = $requireAll ? count($keywords) : 1;
        
        $results = static::objsThatContainKeywords($arrObjs, $arrProperties, $keywords, $requiredNumMatches);
        
        return $results;
    }
    
    public static function objsThatContainKeywords($arrObjs, $properties, $keywords, $requiredNumMatches = 1)
    {
        $results = [];
        foreach ($arrObjs as $obj) {
            $objContainsKeywords = static::objContainsKeywords($obj, $properties, $keywords, $requiredNumMatches);
            if ($objContainsKeywords) {
                array_push($results, $obj);
            } 
        }
        return $results;
    }
    public static function objContainsKeywords($obj, $properties, $keywords, $requiredNumMatches = 1)
    {
        $numMatches = 0;
        foreach ($keywords as $keyword) {
            $objContainsKeyword = static::objContainsKeyword($obj, $properties, $keyword);
            if ($objContainsKeyword) {
                $numMatches++;
            }
        }
        $hasMatches = ($numMatches >= $requiredNumMatches);

        return $hasMatches;
    }
    
    public static function objContainsKeyword($obj, $properties, $keyword)
    {
        if ( count($properties) === 1 && trim($properties[0] === '')  
          || empty($properties)
        ) {
            throw new Exception('attempting to keyword filter an object by property, but no properties declared');
        }
        
        foreach ($properties as $property) {
            if (!isset($obj->$property)) {continue;}
            if ( strpos( strtolower($obj->$property), strtolower($keyword) ) !== false ) {
                return true;
            }
        }

        return false;
    }
    
    
}