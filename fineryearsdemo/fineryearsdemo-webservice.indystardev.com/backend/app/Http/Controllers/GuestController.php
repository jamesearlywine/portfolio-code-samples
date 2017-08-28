<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;
use App\Http\Requests;

use App\Models\ORM\GuestUser;

class GuestController extends Controller
{
    
    /**
     * @brief   Who am I currently identified as?
     * @param   apiKey  Input::apiKey (query param)
     * @return \Illuminate\Http\Response
     */
    public function whoami()
    {
        $objRequest = [
            'apiKey'    => Input::get('apiKey')    
        ];
        
        $errors = [];
        if ( $objRequest['apiKey'] !== Config::get('api.key') ) { array_push($errors, Config::get('errors.201')); }
        
        if (count($errors) > 0) { 
            return Response::json([
                'errors'    => $errors,
                'request'   => $objRequest
            ], 400);
        }
        
        GuestUser::refreshSession();
        return Response::json([
            'whoami'    => GuestUser::whoami()
        ], 200); 
        
        
    
    }

    /**
     * @brief   Does this email exist as a guest user?
     * @param   apiKey  Input::apiKey (query param)
     * @param   email   email address
     * @return \Illuminate\Http\Response
     */
    public function exists($email)
    {
        $errors = [];
        $objRequest = [
            'apiKey'    => Input::get('apiKey'),
            'email'     => $email,
        ];
        $validationRules = [
            'email' => 'email'  
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();
        if (count($validationErrors) > 0)                       {array_push($errors, Config::get('errors.202'));} 
        if ( $objRequest['apiKey'] !== Config::get('api.key') ) { array_push($errors, Config::get('errors.201')); }
        
        if (count($errors) < 1) { 
            return Response::json([
                'exists'    => GuestUser::exists($objRequest['email'])
            ], 200); 
        } 
        return Response::json([
            'errors'            => $errors,
            'validationErrors'  => $validationErrors,
            'request'           => $objRequest
        ], 400);
    }

    /**
     * @brief   Register an email for guest user functionality
     * @param   apiKey  Input::apiKey (query param)
     * @param   email   email to register
     * @return \Illuminate\Http\Response
     */
    public function register($email)
    {
        $errors = [];
        $objRequest = [
            'apiKey'    => Input::get('apiKey'),
            'email'     => $email,
            'login'     => Input::get('login', true),
        ];
        $validationRules = [
            'email' => 'email'  
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();
        if (count($validationErrors) > 0)                       {array_push($errors, Config::get('errors.202'));} 
        if ( $objRequest['apiKey'] !== Config::get('api.key') ) { array_push($errors, Config::get('errors.201')); }
        if ( GuestUser::exists($objRequest['email']) )          { array_push($errors, Config::get('errors.301')); }
            
        if (count($errors) < 1)     { $guestUser = GuestUser::register($email); }
        if ( empty($guestUser) )    { array_push($errors, Config::get('errors.302')); }
        
        
        // if there were no errors 
        if (count($errors) < 1) {
            if ($objRequest['login'])  { return $this->login($email);}    
            return Response::json([ 'success'   => true ]); 
        }
        
        // otherwise show the errors
        return Response::json([
            'success'           => false,
            'errors'            => $errors,
            'validationErrors'  => $validationErrors,
            'request'           => $objRequest 
        ]);

    }

    /**
     * @brief   Login as a guest user (only email is required)
     * @param   apiKey
     * @param   email
     * @return \Illuminate\Http\Response
     */
    public function login($email)
    {
        $errors = [];
        $objRequest = [
            'apiKey'    => Input::get('apiKey'),
            'email'     => $email,
        ];
        $validationRules = [
            'email' => 'email'  
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();        
        if (count($validationErrors) > 0)                       { array_push($errors, Config::get('errors.202')); } 
        if ( $objRequest['apiKey'] !== Config::get('api.key') ) { array_push($errors, Config::get('errors.201')); }
        
        if (count($errors) < 1) { 
            $guestUser = GuestUser::login($email); 
            if ( empty($guestUser) )    { array_push($errors, Config::get('errors.303')); }    
        }

        // if there were no errors 
        if (count($errors) < 1) {
            return $this->whoami();
        }
        
        // otherwise show the errors
        return Response::json([
            'success'           => false,
            'errors'            => $errors,
            'validationErrors'  => $validationErrors,
            'request'           => $objRequest 
        ]);
    }

    /**
     * @brief   Logout guest user (only email is required)
     *
     * @return \Illuminate\Http\Response
     */
    public function logout()
    {
        $errors = [];
        $objRequest = [
            'apiKey'    => Input::get('apiKey'),
        ];
        if ( $objRequest['apiKey'] !== Config::get('api.key') ) { array_push($errors, Config::get('errors.201')); }
        
        GuestUser::logout();
        return $this->whoami();
    }


    /**
     * @brief   Login a user, register them if email doesn't yet exist as user
     * 
     * @return \Illuminate\Http\Response
     */
    public function registerLogin($email)
    {
        $objRequest = [
            'email'     => $email,
            'apiKey'    => Input::get('apiKey', null)
        ];
        
        $errors = [];
        $validationRules = [
            'email' => 'email'  
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();        
        if (count($validationErrors) > 0)                       { array_push($errors, Config::get('errors.202')); } 
        if ( $objRequest['apiKey'] !== Config::get('api.key') ) { array_push($errors, Config::get('errors.201')); }
        
        // if there were no errors 
        if (count($errors) < 1) {
            // if the user exists
            if ( GuestUser::exists($objRequest['email']) ) {
                // log them in
                return $this->login($objRequest['email']);
            } else { // otherwise
                // register them, then log them in
                return $this->register($objRequest['email'], true);
            }
        }
        
        // otherwise show the errors
        return Response::json([
            'success'           => false,
            'errors'            => $errors,
            'validationErrors'  => $validationErrors,
            'request'           => $objRequest 
        ]);
        
        

        
    }



}
