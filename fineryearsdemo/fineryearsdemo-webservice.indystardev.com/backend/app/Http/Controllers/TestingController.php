<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use App\Http\Requests;

use App\Models\ORM\Community;

class TestingController extends Controller
{
    public function requestResponse()
    {
        $objRequest = Input::all();
        $objRequest = $this->adjustNullValues($objRequest);
        
        $objRequest['amenities']        = json_decode($objRequest['amenities']);
        $objRequest['imageData']        = json_decode($objRequest['imageData']);
        $objRequest['galleryImagesData'] = json_decode($objRequest['galleryImagesData']);
        
        $objResponse = [
            'request' => $objRequest    
        ];
        
        return Response::json($objResponse);
    }
   
    public function getSession()
    {
      return Response::json([
         'session' => Session::all()
      ]);
    }   
    public function getCookies()
    {
      return Response::json([
         'session' => Cookie::get()
      ]);
    }
    public function testQuery()
    {
      $input = Input::all();
      return Response::json([
        'input' => $input
      ]);
    }
}

