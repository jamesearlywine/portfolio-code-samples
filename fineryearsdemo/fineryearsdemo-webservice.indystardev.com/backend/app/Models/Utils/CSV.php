<?php
namespace App\Models\Utils;

class CSV {
    
    // most of this code came from: http://php.net/manual/en/function.fgetcsv.php#66674 --jle
    // treats first line as column headers
    public static function fromFilepath($filepath)
    {
        $response = [];
        
        //Move through a CSV file, and output an associative array for each line 
        ini_set("auto_detect_line_endings", 1); 
        $current_row = 1; 
        $handle = fopen($filepath, "r"); 
        while ( ($data = fgetcsv($handle, 10000, ",") ) !== FALSE ) 
        { 
            $number_of_fields = count($data); 
            if ($current_row == 1) 
            { 
            //Header line 
                for ($c=0; $c < $number_of_fields; $c++) 
                { 
                    $header_array[$c] = $data[$c]; 
                } 
            } 
            else 
            { 
            //Data line 
                for ($c=0; $c < $number_of_fields; $c++) 
                { 
                    $data_array[$header_array[$c]] = $data[$c]; 
                } 
                array_push($response, $data_array); 
            } 
            $current_row++; 
        } 
        fclose($handle); 
        
        return $response;
    }
    
    
}