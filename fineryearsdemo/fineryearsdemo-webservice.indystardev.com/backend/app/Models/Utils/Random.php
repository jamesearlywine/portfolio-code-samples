<?php
namespace App\Models\Utils;

class Random {
    public static function chars($options = [])
    {
        $defaults = [
            'numChars'      => 13,
            'validChars'    => 'abcdefghijklmnopqrstuvwxyz1234567890',
            'allowRepeat'   => true,
            'timestamp'     => false,
            'delimeter'     => '_'
        ];
        $options = array_merge($defaults, $options);
        
        $randomString = $options['allowRepeat'] 
            ? static::get_random_string(            $options['numChars'], $options['validChars'] ) 
            : static::get_random_string_norepeat(   $options['numChars'], $options['validChars'] )
        ;
        
        $randomString = $options['timestamp'] 
            ? time() . $options['delimeter'] . $randomString 
            : $randomString
        ;

        return $randomString;
    } 
    
    protected static function get_random_string_norepeat($length, $valid_chars)
    {
        // start with an empty random string
        $random_string = "";
    
        // count the number of chars in the valid chars string so we know how many choices we have
        $num_valid_chars = strlen($valid_chars);
    
        // repeat the steps until we've created a string of the right length
        for ($i = 0; $i < $length; $i++)
        {
            // pick a random number from 1 up to the number of valid chars
            $random_pick = mt_rand(1, $num_valid_chars);
    
            // take the random character out of the string of valid chars
            // subtract 1 from $random_pick because strings are indexed starting at 0, and we started picking at 1
            $random_char = $valid_chars[$random_pick-1];
    
            // add the randomly-chosen char onto the end of our string so far
            $random_string .= $random_char;
        }
    
        // return our finished random string
        return $random_string;
    }
    
    
    protected static function get_random_string($length, $valid_chars)
    {
        $str = '';
        $count = strlen($valid_chars);
        while ($length--) {
            $str .= $valid_chars[mt_rand(0, $count-1)];
        }
        return $str;
    }
    
}