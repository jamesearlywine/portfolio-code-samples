<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use App\Http\Requests;

use App\Models\Demo;

class DemoController extends Controller
{
   public function postResetDatabase()
   {
        
        $response = Demo::resetDatabase();
        /*
        return Response::json([
            'success'   => true,
            // 'debugInfo'  => $response
        ]);
        */
        return Redirect::to('/admincms');
        
   }
   
   
}

