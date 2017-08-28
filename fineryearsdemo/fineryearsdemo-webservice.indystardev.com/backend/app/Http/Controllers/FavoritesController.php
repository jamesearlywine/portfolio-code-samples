<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;
use App\Http\Requests;

use App\Models\ORM\GuestUser;
use App\Models\ORM\Community;

class FavoritesController extends Controller
{
    
    protected function getFavoritesRequest()
    {
        GuestUser::refreshSession();
        $objRequest = [
            // csv to array, all elements whitespace-trimmed, empty elements removed
            'favorite_communities'      => array_filter(array_map('trim', explode(',', Input::get('favorite_communities', '')))),
            'user'                      => GuestUser::whoami()
        ];
        
        return $objRequest;
    }
    
    public function addFavorites()
    {
        $objRequest = $this->getFavoritesRequest();
        if ( empty($objRequest['favorite_communities']) ) {
            return Response::json([ 'whoami' => $objRequest['user'] ]);
        }
 
        $guestUser = Session::get('GuestUser', null);
        if (!is_null($guestUser)) {
            $guestUser->addFavorites($objRequest['favorite_communities']);
        }
 
        GuestUser::refreshSession();
        $objResponse = [
          'request'     => $objRequest,
          'guestUser'   => $guestUser,
          'whoami'      => GuestUser::whoami()
        ];
        return Response::json($objResponse);
        
    }
    public function removeFavorites()
    {
        $objRequest = $this->getFavoritesRequest();
        $guestUser = Session::get('GuestUser', null);
        $user = GuestUser::find($guestUser['id']);
        if ( empty($objRequest['favorite_communities']) 
            || empty($user)
        ) {
            return Response::json([ 'whoami' => $objRequest['user'] ]);
        }
        
        if (!is_null($user)) {
            $user->removeFavorites($objRequest['favorite_communities']);
        }
        
        GuestUser::refreshSession();
        $objResponse = [
          // 'request' => $objRequest,
          'whoami'  => GuestUser::whoami()
        ];
        return Response::json($objResponse);
        
    }
    public function setFavorites()
    {
        $objRequest = $this->getFavoritesRequest();
        if ( empty($objRequest['favorite_communities']) ) {
            $objRequest['favorite_communities'] = [];
        }
        
        $guestUser = Session::get('GuestUser', null);
        if (!is_null($guestUser)) {
            $user = GuestUser::find($guestUser['id']);
            $user->setFavorites($objRequest['favorite_communities']);
        }
        
        GuestUser::refreshSession();
        $objResponse = [
          // 'request' => $objRequest,
          'whoami'  => GuestUser::whoami()
        ];
        return Response::json($objResponse);

    }


}
