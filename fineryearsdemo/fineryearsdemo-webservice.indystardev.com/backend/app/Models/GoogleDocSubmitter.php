<?php namespace App\Models;

/**
 * @brief   Submits Data to a GoogleDoc 
 *          via the Google FormData Receptor/EndpointURL
 */
class GoogleDocSubmitter {
    
    public $type            = 'default';
    public $formEndpoint    = null;
    public $fieldsMap       = [];
    public $data            = [];
    public $googleFormData  = [];
    public $rawResponse     = null;
    
    public function __construct() {
        
    }
    
    // fluent mutators/accessors
    public function formEndpoint($formEndpoint = null) {
        if (is_null($formEndpoint)) {
            return $this->formEndpoint;
        } else {
            $this->formEndpoint = $formEndpoint;
            return $this;
        }
    }
    public function data($data = null) {
        if (is_null($data)) {
            return $this->data;
        } else {
            $this->data = $data;
            return $this;
        }
    }
    public function type($type = null) {
        if (is_null($type)) {
            return $this->type;
        } else {
            $this->type = $type;
            return $this;
        }
    }
    public function rawResponse($rawResponse = null) {
        if (is_null($rawResponse)) {
            return $this->rawResponse;
        } else {
            $this->rawResponse = $rawResponse;
            return $this;
        }
    }
    // execute
    public function submit() {
        
        // initialize from config
        if (is_null($this->formEndpoint)) {
            $this->formEndpoint = \Config::get('googledoc.'.$this->type.'s.submissionsEndpoint');    
        }
        $this->fieldsMap    = \Config::get('googledoc.'.$this->type.'s.formFields');
        
        // parse the data array, normalizing it for submission 
        $this->_buildGoogleFormData();
        
        // submit via cURL
        $curl_connection = curl_init();
        curl_setopt($curl_connection, CURLOPT_CONNECTTIMEOUT, 60);
        curl_setopt($curl_connection, CURLOPT_USERAGENT,
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)");
        curl_setopt($curl_connection, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl_connection, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl_connection, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl_connection, CURLOPT_POST, 1);
        curl_setopt($curl_connection, CURLOPT_POSTFIELDS, http_build_query($this->googleFormData));
        curl_setopt($curl_connection, CURLOPT_URL, $this->formEndpoint);
        
        // save rawresponse
        $this->rawResponse(curl_exec($curl_connection));
        curl_close($curl_connection);
        
        return $this;
    }
    // mutate
    public function _buildGoogleFormData() {
        // re-initialize google form data
        $this->googleFormData = [];
        
        // transpore from $this->data use $this->fieldsMap
        foreach($this->fieldsMap as $key => $formField) {
            $this->googleFormData[$formField] = $this->data->$key;
        }

        return $this;
    }
    // return new instance
    public static function instance() {
        return new static();
    }
}
