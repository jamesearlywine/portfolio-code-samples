<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use App\Http\Requests;

use App\Models\ORM\Community;
use App\Models\ORM\InformationRequest;

class EmailController extends Controller
{
   public function communitySubmissionConfirmationPreview($communityId)
   {
        $sendEmail = Input::get('send');
        
        $emailTemplate = 'emails.community-submission-confirmation';
       
        $community = Community::find($communityId);
        
        // if no community was found, the id supplied is likely invalid
        if ( empty($community) ) {
            return Response::json([
                'error' => 'community id (' . $communityId . ') is not valid.'
            ]);
        }
        
        if(!empty($community['s3_image_url'])) {
            $filename   = $community['s3_image_url'];
            $ext        = pathinfo($filename, PATHINFO_EXTENSION);
            $contents   = file_get_contents();
            $base64     = 'data:image/' . $ext . ';base64,' . base64_encode($contents);
            $community->s3_image_url_base64 = $base64;
        }
        
        
        // if send was requested, send email
        if (!empty($sendEmail)) {
            Mail::send(
                $emailTemplate, 
                ['community' => $community], 
                function ($m) use ($sendEmail) {
                    $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                    $m->to($sendEmail, $sendEmail)->subject('The Finer Years: Submission Confirmation');
                }
            );
        }

        // return the view
        return view($emailTemplate, 
                    [ 'community' => $community->toArray() ]
        );
   }
   public function communitySubmissionAdminNotificationPreview($communityId)
   {
        $sendEmail = Input::get('send');
        
        $emailTemplate = 'emails.community-submission-admin-notification';
       
        $community = Community::find($communityId);
        
        // if no community was found, the id supplied is likely invalid
        if ( empty($community) ) {
            return Response::json([
                'error' => 'community id (' . $communityId . ') is not valid.'
            ]);
        }
        
        if(!empty($community['s3_image_url'])) {
            $filename   = $community['s3_image_url'];
            $ext        = pathinfo($filename, PATHINFO_EXTENSION);
            $contents   = file_get_contents();
            $base64     = 'data:image/' . $ext . ';base64,' . base64_encode($contents);
            $community->s3_image_url_base64 = $base64;
        }
        
        $cmslink = env('APP_URL', '') . '/admincms/communities?id=' . $community->id;

        // if send was requested, send email
        if (!empty($sendEmail)) {
            Mail::send(
                $emailTemplate, 
                [ 
                    'community' => $community->toArray(),
                    'cmslink'   => $cmslink
                ],
                function ($m) use ($sendEmail) {
                    $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                    $m->to($sendEmail, $sendEmail)->subject('The Finer Years: New Basic Submission');
                }
            );
        }

        // return the view
        return view($emailTemplate, 
                    [ 
                        'community' => $community->toArray(),
                        'cmslink'   => $cmslink
                    ]
        );
   }
   
   public function communityUpdateConfirmationPreview($communityId)
   {
        $sendEmail = Input::get('send');
       
        $emailTemplate = 'emails.community-update-confirmation';
       
        $objCommunity = Community::find($communityId);
        $community    = $objCommunity->toArray();
        $community['enhancedViewURL'] = $objCommunity->enhancedViewURL(false);
        
        // if no community was found, the id supplied is likely invalid
        if ( empty($community) ) {
            return Response::json([
                'error' => 'community id (' . $communityId . ') is not valid.'
            ]);
        }
        
        // if send was requested, send email
        if (!empty($sendEmail)) {
            Mail::send(
                $emailTemplate, 
                ['community' => $community], 
                function ($m) use ($sendEmail) {
                    $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                    $m->to($sendEmail, $sendEmail)->subject('The Finer Years: Update Confirmation');
                }
            );
        }

        // return the view
        return view($emailTemplate, 
                    [ 'community' => $community ]
        );
   }
   
   public function communityRequestMoreInformationPreview($communityId)
   {
        /**
         * name     // required
         * email    // required
         * message  // required
         * phone    // optional
         * send     // optional
         */
        $objRequest = Input::all();
        // defaults for optional values
        $defaults = [
            'phone' => null,
            'send'  => false
        ];
        $objRequest['phone']    = isset($objRequest['phone'])   ? $objRequest['phone']  : $defaults['phone'];
        $objRequest['send']     = isset($objRequest['send'])    ? $objRequest['send']   : $defaults['send'];
        
        
        $emailTemplate = 'emails.community-request-more-information';
       
        $objCommunity = Community::find($communityId);
        $community    = $objCommunity->toArray();
        $community['enhancedViewURL'] = $objCommunity->enhancedViewURL(false);
        
        /**
         * Input Errors
         */
        $errors = [];
        $validationRules = [
            'name'      => 'required',
            'email'     => 'required',
            'message'   => 'required',
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();        
        // validation errors?
        if (count($validationErrors) > 0)                       { array_push($errors, Config::get('errors.202')); } 
        // if no community was found, the id supplied is likely invalid
        if ( empty($community) ) {
            array_push( $errors, str_replace('{{communityId}}', $communityId, Config::get('errors.401')) );
        }
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
        
        
        // if send was requested, send email
        if (!empty($objRequest['send'])) {
            Mail::send(
                $emailTemplate, 
                [   'community' => $community,
                    'request'   => $objRequest
                ], 
                function ($m) use ($objRequest) {
                    $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                    $m->to($objRequest['email'], $objRequest['email'])->subject('The Finer Years - Request for more information');
                }
            );
        }

        // return the view
        return view($emailTemplate, 
                    [   'community' => $community,
                        'request'   => $objRequest
                    ]
        );
   }
   public function communityRequestMoreInformation($communityId)
   {
        /**
         * name     // required
         * email    // required
         * message  // required
         * phone    // optional
         * send     // optional
         */
        $objRequest = Input::all();
        // defaults for optional values
        $defaults = [
            'phone' => null,
            'send'  => false
        ];
        $objRequest['phone']    = isset($objRequest['phone'])   ? $objRequest['phone']  : $defaults['phone'];
        $objRequest['send']     = isset($objRequest['send'])    ? $objRequest['send']   : $defaults['send'];
        
        
        $emailTemplate = 'emails.community-request-more-information';
       
        $objCommunity = Community::find($communityId);
        $community    = $objCommunity->toArray();
        $community['enhancedViewURL'] = $objCommunity->enhancedViewURL(false);
        
        /**
         * Input Errors
         */
        $errors = [];
        // validation errors?
        $validationRules = [
            'name'      => 'required',
            'email'     => 'required',
            'message'   => 'required',
        ];
        $validationErrors = \Validator::make($objRequest, $validationRules)->messages()->all();        
        if (count($validationErrors) > 0)   { array_push($errors, Config::get('errors.202')); } 
        
        // if no community was found, the id supplied is likely invalid
        if ( empty($community) ) { array_push( $errors, str_replace('{{communityId}}', $communityId, Config::get('errors.401')) ); }
        
        // where do we send the email?
        $sendTo = null;
        if ( empty($sendTo) && !empty($community['email']) )                  {$sendTo = $community['email'];}
        if ( empty($sendTo) && !empty($community['facility_manager_email']) ) {$sendTo = $community['facility_manager_email'];}
        // can't send the email with no sendTo..
        if (  empty($sendTo) )              { array_push($errors, Config::get('errors.501')); }
        
        // if errors, return error response
        if (count($errors) > 0) { // if there are errors
            return Response::json([
                'errors'            => $errors,
                'validationErrors'  => $validationErrors,
                'request'           => $objRequest
            ], 500);
        }
        
        // otherwise..
        
        // send the email
        Mail::send(
            $emailTemplate, 
            [   'community' => $community,
                'request'   => $objRequest
            ], 
            function ($m) use ($objRequest, $sendTo) {
                $m->from( Config::get('mail.from.address'), Config::get('mail.from.name') );
                $m->to($sendTo, $sendTo)->subject('The Finer Years - Request for more information');
            }
        );

        // log the information request
        $informationRequest = InformationRequest::create([
            'name'      => $objRequest['name'],
            'email'     => $objRequest['email'],
            'phone'     => $objRequest['phone'],
            'message'   => $objRequest['message']
        ]);
        $informationRequest->community()->associate($objCommunity);
        $informationRequest->save();

        return Response::json([
            // 'sentTo'        => $sendTo,
            'success'       => true    
        ]);
        
   }
   
   public function viewImage()
   {
        $image_location = urldecode(Input::get('image'));
        $s3_image_url   = Config::get('s3.bucketUrl')
                        . Config::get('s3.imageCache')
                        . '/'
                        . $image_location
        ;
        return view('emails.view-image',
            ['s3_image_url' => $s3_image_url]
        );
   }
   
   
}

