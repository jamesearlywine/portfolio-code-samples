<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use App\Http\Requests;

use App\Models\ORM\Community;
use App\Models\Utils\FilenameGenerator;

class CommunityController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Response::json( Community::get() );
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Response::json( Community::find($id)->get() );
    }
    
    /**
     * Display the specified resource (referenced by enhanced update API key).
     *
     * @param  int  $key
     * @return \Illuminate\Http\Response
     */
    public function getCommunityByEnhancedUpdateApiKey()
    {
        $objRequest = Input::all();
        $objRequest = $this->adjustNullValues($objRequest);
        
        $errors = [];
        if ( empty($objRequest['apiKey']) || $objRequest['apiKey'] !== Config::get('api.key') ) { 
            array_push($errors, Config::get('errors.201')); 
        }
        $community =  Community::byEnhancedUpdateApiKey( $objRequest['enhanced_update_api_key'] );
        if (empty($community)) { array_push($errors, Config::get('errors.201')); }

        if (count($errors) > 0) { // if there are errors
            return Response::json([
                'errors'            => $errors,
                'request'           => $objRequest
            ], 500);
        }
        
        return Response::json( $community );
    }

    /**
     * Community Submission (advertise with us) - formData handler
     */
    public function submission()
    {
        $objRequest = Input::all();
        $objRequest = $this->adjustNullValues($objRequest);

        /* dummy error 
        return Response::json([
            'errors' => [
                ['number' => 0, 'description' => 'dummy error']
            ],
            'request' => $objRequest
        ], 501);
        */
        
        /**
         * Input Errors
         */
        $errors = [];
        $validationRules = [
            'apiKey'        => 'required',
            'name'          => 'required',
            'address1'      => 'required',
            'city'          => 'required',
            'state'         => 'required',
            'zip'           => 'required',
            'phone'         => 'required|size:10',
            //'email'         => 'required|email',
            //'website'       => 'required',
            //'image'         => 'required',
            //'regions'       => 'required',
            //'communityCategories'   => 'required',
            'submitter_name'        => 'required',
            'submitter_phone'       => 'required',
            'submitter_email'       => 'required',
            
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();        
        if (count($validationErrors) > 0)                       { array_push($errors, Config::get('errors.202')); } 
        if ( empty($objRequest['apiKey']) || $objRequest['apiKey'] !== Config::get('api.key') ) { 
            array_push($errors, Config::get('errors.201')); 
        }

        if (count($errors) > 0) { // if there are errors
            return Response::json([
                'errors'            => $errors,
                'validationErrors'  => $validationErrors,
                'request'           => $objRequest
            ], 500);
        }
        unset($objRequest['apiKey']);
        
        /**
         * No Errors, handle request
         */
        // create Community from formData and uploaded file
        $newCommunity   = Community::createFromAdvertiseFormSubmission($objRequest);

        /**
         * Email Notifications
         */
        // notify submitter confirmation of submission
        Mail::send(
            'emails.community-submission-confirmation',
            ['community' => $newCommunity->toArray()], 
            function ($m) use ($objRequest) {
                $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                $m->to($objRequest['submitter_email'], $objRequest['submitter_email'])->subject('The Finer Years: Submission Confirmation');
            }
        );

        $cmslink = env('APP_URL', '') . '/admincms/communities?id=' . $newCommunity->id;

        // notify admins of submission
        foreach (Config::get('notifications.communitySubmission.admins') as $emailAddress) {
            Mail::send(
                'emails.community-submission-admin-notification', 
                ['community' => $newCommunity->toArray(),
                 'cmslink'   => $cmslink
                ], 
                function ($m) use ($emailAddress) {
                    $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                    $m->to($emailAddress, $emailAddress)->subject('The Finer Years: New Basic Submission');
                }
            );
        }
        
        /**
         * Response
         */
        // return Response::json($newCommunity);
        
        // response
        $objResponse = [
            'request'       => $objRequest,
            //'newFilename'   => $newFilename,
            //'newFilepath'   => $newFilepath,
            'newCommunity'  => $newCommunity
        ];
        
        return Response::json($objResponse);
    }


    /**
     * Enhanced Update Community Submission - formData handler
     */
    public function enhancedUpdateSubmission()
    {
        
        $objRequest = Input::all();
        $objRequest = $this->adjustNullValues($objRequest);
        
        $objRequest['amenities']            = json_decode($objRequest['amenities']);
        $objRequest['imageData']            = json_decode($objRequest['imageData']);
        $objRequest['galleryImagesData']    = json_decode($objRequest['galleryImagesData']);
        $objRequest['communityCategories']  = json_decode($objRequest['communityCategories']);
        
        $objResponse = [
            'request' => $objRequest    
        ];
        
        /* debug info */
        // return Response::json($objResponse);
        
        
        /**
         * Input Errors
         */
        $errors = [];
        $validationRules = [
            'apiKey'        => 'required',
            'name'          => 'required',
            'address1'      => 'required',
            'city'          => 'required',
            'state'         => 'required',
            'zip'           => 'required',
            'phone'         => 'required|size:10',
            //'email'         => 'required|email',
            //'website'       => 'required',
            //'image'         => 'required',
            //'regions'       => 'required',
            //'communityCategories'   => 'required',
            'submitter_name'        => 'required',
            'submitter_phone'       => 'required',
            'submitter_email'       => 'required',
            
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();        
        if (count($validationErrors) > 0)  { array_push($errors, Config::get('errors.202')); } 
        if ( empty($objRequest['apiKey']) || $objRequest['apiKey'] !== Config::get('api.key') ) { 
            array_push($errors, Config::get('errors.201')); 
        }
        $existingCommunity  = Community::byEnhancedUpdateApiKey( $objRequest['enhanced_update_api_key'] );
        if (empty($existingCommunity)) { array_push($errors, Config::get('errors.201')); }
        
        if (count($errors) > 0) { // if there are errors
            return Response::json([
                'errors'            => $errors,
                'validationErrors'  => $validationErrors,
                'request'           => $objRequest
            ], 500);
        }
        
        /**
         * No Errors, handle request
         */
        // create Community from formData and uploaded file
        $updatedCommunity   = Community::enhancedUpdateFormSubmission($objRequest, $existingCommunity);
        $community          = $updatedCommunity->toArray();
        $community['enhancedViewURL'] = $updatedCommunity->enhancedViewURL(false);
        
        /**
         * Email notifications
         */
        // notify submitter confirmation of submission
        Mail::send(
            'emails.community-update-confirmation',
            ['community' => $community], 
            function ($m) use ($objRequest) {
                $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                $m->to($objRequest['submitter_email'], $objRequest['submitter_email'])->subject('The Finer Years: Enhanced Update Confirmation');
            }
        );

        /**
         * Response
         */
        // return Response::json($newCommunity);
        
        // response
        $objResponse = [
            // 'request'       => $objRequest,
            'updatedCommunity'  => $updatedCommunity
        ];
        
        return Response::json($objResponse);
    }


    public function getCitiesAndZips()
    {
        $objRequest = [
            'apiKey' => Input::get('apiKey')
        ];
        $errors = [];
        if ( empty($objRequest['apiKey']) || $objRequest['apiKey'] !== Config::get('api.key') ) { 
            array_push($errors, Config::get('errors.201')); 
        }
        if (count($errors) > 0) { // if there are errors
            return Response::json([
                'errors'            => $errors,
                'request'           => $objRequest
            ], 500);
        }
                
        // response
        $objResponse = Community::citiesAndZips();
        
        return Response::json($objResponse);
        
    }














    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
