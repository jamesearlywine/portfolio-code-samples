<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use App\Http\Requests;

use App\Models\ORM\Community;
use App\Models\ORM\InformationRequest;

use League\Csv\Writer;
use Schema;

class DownloadsController extends Controller
{
   public function getInformationRequestsCSV()
   {
        // get the data from the database
        $informationRequests = InformationRequest::all();
        
        // instantiate csv
        $csv = \League\Csv\Writer::createFromFileObject(new \SplTempFileObject());
        
        // first row (header row)
        $csv->insertOne([
            'id',
            'community_id',
            'community_name',
            'community_email',
            'community_contact_email',
            'name',
            'email',
            'phone',
            'message'
        ]);
        
        // insert into csv each information request
        foreach ($informationRequests as $informationRequest) {
            $csv->insertOne([
                $informationRequest->id,
                $informationRequest->community_id,
                $informationRequest->community['name'],
                $informationRequest->community['email'],
                $informationRequest->community['facility_manager_email'],
                $informationRequest->name,
                $informationRequest->email,
                $informationRequest->phone,
                $informationRequest->message,
            ]);
        }
   
        // csv library output() method handles headers and such
        $csv->output('informationRequests.csv');
        
        //return Response::json($informationRequests);
   }
   
   
}

