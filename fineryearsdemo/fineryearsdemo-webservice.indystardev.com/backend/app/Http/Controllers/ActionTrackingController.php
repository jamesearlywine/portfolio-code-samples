<?php namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Response;

use Carbon\Carbon;

use App\Models\GoogleDocSubmitter;

class ActionTrackingController extends Controller {
    
    public function showErrors() {
            
        ini_set('display_errors',1);
        ini_set('display_startup_errors',1);
        error_reporting(-1);

    }
    /**
     * @brief   Records that someone did some $action
     */
    public function postRecordAction(Request $request) {
        
        // debugging
        $this->showErrors();
        
        // get inputs and normalize (trim whitespace, lowercase)
        $apiKey         = trim(Input::get('apiKey'));
        $page           = trim(strtolower(Input::get('page')));
        $actionType     = trim(strtolower(Input::get('actionType')));
        $actionDetail   = trim(strtolower(Input::get('actionDetail')));

        // whitelist input
        if ($apiKey !== Config::get('api.apiKey')) {
             echo PHP_EOL . "bad api key";
             die();
            
            // return empty response 
            return '';
        }
        
        if(     ! in_array($page, Config::get('input.whitelists.pages')) 
            &&  ! empty($page)
        )
        {
            return  \Response::json([
                        'error' => 'That page is not allowed'
                    ]);
        }
        if(     ! in_array($actionType, Config::get('input.whitelists.actionTypes')) 
            &&  ! empty($actionType)
        )
        {
            return  \Response::json([
                        'error' => 'That actionType is not allowed'
                    ]);
        }
        if(     ! in_array($actionDetail, Config::get('input.whitelists.actionDetails')) 
            &&  ! empty($actionDetail)
        )
        {
            return  \Response::json([
                        'error' => 'That actionDetail is not allowed'
                    ]);
        }
        

        // build request object
        $oRequest = new \stdClass();
        $oRequest->page         = $page;
        $oRequest->actionType   = $actionType;
        $oRequest->actionDetail = $actionDetail;
        
        
        // submit to googledoc
        $googleDocSubmitter = GoogleDocSubmitter::instance();
        $googleDocSubmitter
            ->type(         'action'    )
            ->data(         $oRequest   )
            ->submit()
        ;
        
        
        // api response 
        // $oResponse = new \stdClass();
        // $oResponse->request = $oRequest;
        // $oReqponse->googleDocSubmitter = $googleDocSubmitter;
        // return \Response::json($oResponse);
        
        // empty response to client-side
        return Response::json(['success' => true]);
        
    }
    
    
    
}
