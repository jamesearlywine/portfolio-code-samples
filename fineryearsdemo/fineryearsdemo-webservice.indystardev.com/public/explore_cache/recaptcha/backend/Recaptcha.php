<?php
require_once('config.php');
require_once('lib/recaptcha/vendor/autoload.php');
abstract class Recaptcha {
    
    /**
     * Check a response token
     */
    public static function check($g_recaptcha_response)
    {
        global $recaptchaConfig;
        $server_secret_key  = $recaptchaConfig->server_secret_key;
        $recaptcha          = new \ReCaptcha\ReCaptcha($recaptchaConfig->server_secret_key);
        return $recaptcha->verify($g_recaptcha_response);
    }
    /**
     * Check if response token is valid (assumes $_POST['g-recaptcha-response'] contains the token)
     */
    public static function isValid()
    {
        if (!isset($_POST['g-recaptcha-response'])) {return false;}
        $check = static::check($_POST['g-recaptcha-response']); 
        if (is_object($check)) {
           return $check->isSuccess();
        } else {
           return false;
        }
    }
}