<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>The Finer Years: Submission Admin Notification</title>
  </head>
  <body >
    <!-- EMAIL -->
    <table align="center" style="background-color:#FFFFFF; font-family:Arial; color:#333333; border-collapse:collapse; margin:0 auto 0 auto;">
        <tr>
            <td>
                <!-- OUTER TOP -->
                <table align="center" style="width:100%; max-width:600px; font-size:12px; border-collapse:collapse; margin:0 auto 0 auto;">
                    <tr>
                        <td>
                            <table align="center" style="width:100%; margin:0 auto 0 auto;">
                                <tr>
                                   <td style="text-align:center;"></td>
                                </tr>
                            </table><!-- end .row -->
                        </td>
                    </tr>
                </table>
                <!-- END OUTER TOP -->
                
                <!-- INNER MAIN CONTAINER -->
                <table align="center" style="width:100%; max-width:600px; font-size:14px; background-color:#FFFFFF; border:1px solid #269a9d; border-collapse:collapse; margin:0 auto 0 auto;">
                    <tr>
                        <td>
                            <!-- BANNER -->
                            <table align="center" style="width:100%; margin:0 auto 0 auto; background-color:#269a9d; border-collapse:collapse;">
                              <tr>
                                <td style="text-align:center;">
                                    <a href="http://www.fineryears.com" 
                                      target="_blank" style="border:none;"
                                    >
                                    @if (!empty($message))
                                      <img style="border:none;" 
                                            alt="The Finer Years"
                                            src="{{$message->embed(env('WEBCLIENT_URL') . '/common/img/email-banner2.jpg')}}" 
                                      > 
                                    @else
                                      <img style="border:none;" 
                                            alt="The Finer Years"
                                            src="{{env('WEBCLIENT_URL')}}/common/img/email-banner2.jpg" 
                                      >
                                    @endif
                                    </a>
                                </td>
                              </tr>
                            </table><!-- end .row -->
                            
                            <!-- BODY -->
                            <table align="center" style="width:100%; margin:0 auto 0 auto; border-collapse:collapse;">
                                <tr>
                                    <td>
                                        <!-- MESSAGE -->
                                        <table align="center" style="width:95%; margin:0 auto 0 auto;">
                                          <tr>
                                            <td style="padding:5px; vertical-align:top; word-break:break-all;">A new basic listing was submitted. Please approve the submission at: <a href="{{$cmslink}}">{{$cmslink}}</a>.</td>
                                          </tr>
                                        </table>
                                        
                                        <!-- COMMUNITY INFORMATION -->
                                        <table align="center" style="width:95%; margin:0 auto 0 auto;">
                                          <tr>
                                            <th colspan="2" style="color:#105363; padding:5px; background-color:#f6d882; text-align:center;">COMMUNITY INFORMATION</th>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Name:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['name']}}</td>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Address:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['address1']}} {{$community['address2']}}
                                            <br>{{$community['city']}}, {{$community['state']}} {{$community['zip']}}</td>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Region(s):</td>
                                            <td style="padding:5px; vertical-align:top;">
                                              @if (is_array($community['regions']))
                                                @foreach ($community['regions'] as $key => $region)
                                                  {{ $region['name'] }}@if ( $key <  count($community['regions'])-1 ),@endif
                                                @endforeach
                                              @endif                                              
                                            </td>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Phone:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['phone']}}</td>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Email:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['email']}}</td>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Website:</td>
                                            <td style="padding:5px; vertical-align:top; word-break:break-all;">{{$community['website']}}</td>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Logo or Photo:</td>
                                            <td style="padding:5px; vertical-align:top;">
                                              @if ( !empty($community['image_url']) )
                                                <a href="{{env('APP_URL')}}/emails/viewImage?image={{urlencode($community['image_url'])}}"
                                                    target="_blank" style="border:none;">View image</a>
                                              @endif
                                            </td>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Living and Care Types:</td>
                                            <td style="padding:5px; vertical-align:top;">
                                              @if (is_array($community['category_memberships']))
                                                @foreach ($community['category_memberships'] as $key => $categoryMembership)
                                                  {{ $categoryMembership['category']['name'] }}@if ( $key <  count($community['category_memberships'])-1 ),@endif
                                                @endforeach
                                              @endif
                                            </td>
                                          </tr>
                                        </table>
                                        
                                        <!-- FACILITY INFORMATION -->
                                        <table align="center" style="width:95%; margin:0 auto 0 auto;">
                                          <tr>
                                            <th colspan="2" style="color:#105363; padding:5px; background-color:#f6d882; text-align:center;">FACILITY INFORMATION</th>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Manager:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['facility_manager']}}</td>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Phone:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['facility_manager_phone']}}</td>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Email:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['facility_manager_email']}}</td>
                                          </tr>
                                        </table>
                                        
                                        <!-- SUBMITTER INFORMATION -->
                                        <table align="center" style="width:95%; margin:0 auto 0 auto;">
                                          <tr>
                                            <th colspan="2" style="color:#105363; padding:5px; background-color:#f6d882; text-align:center;">SUBMITTER INFORMATION</th>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Name:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['submitter_name']}}</td>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Phone:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['submitter_phone']}}</td>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Email:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$community['submitter_email']}}</td>
                                          </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table><!-- end .row -->
                            
                            <!-- FOOTER -->
                            <table align="center" style="width:100%; margin:0 auto 0 auto; font-size:14px; background-color:#269a9d; border-collapse:collapse;">
                                <tr>
                                    <td>
                                        <table align="center" style="width:100%; margin:0 auto 0 auto;">
                                           <tr>
                                               <td style="text-align:center;">
                                                   <a href="http://www.indystarmedia.com" 
                                                      target="_blank" style="border:none;"
                                                    >
                                                    @if (!empty($message))
                                                      <img style="border:none;" 
                                                            alt="StarMedia"
                                                            src="{{$message->embed( env('WEBCLIENT_URL') . '/common/img/email-starmedia2.jpg')}}" 
                                                      > 
                                                    @else
                                                      <img src="{{env('WEBCLIENT_URL')}}/common/img/email-starmedia2.jpg" 
                                                          alt="StarMedia" style="border:none;"
                                                          />
                                                    @endif
                                                   </a>
                                               </td>
                                           </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table><!-- end .row -->
                        </td>
                    </tr>
                </table>
                <!-- END INNER MAIN CONTAINER -->
                
                <!-- OUTER BOTTOM -->
                <table align="center" style="width:100%; max-width:600px; font-size:12px; margin:0 auto 0 auto; border-collapse:collapse;">
                    <tr>
                        <td>
                            <table align="center" style="width:100%; margin:0 auto 0 auto;">
                                <tr>
                                   <td style="text-align:center; padding:5px; vertical-align:top;">
                                      <a href="http://static.indystar.com/terms/" target="_blank" style="border:none;">Terms of Service</a> | 
                                      <a href="http://static.indystar.com/privacy/" target="_blank" style="border:none;">Privacy</a> | 
                                      <a href="http://static.indystar.com/privacy/#adchoices" target="_blank" style="border:none;">Ad Choices</a>
                                   </td>
                                </tr>
                            </table><!-- end .row -->
                        </td>
                    </tr>
                </table>
                <!-- END OUTER BOTTOM -->
            </td>
        </tr>
    </table>
    <!-- END EMAIL -->
  </body>
</html>

<!-- https://laravel.com/docs/5.2/blade -->
{{-- json_encode($community, JSON_PRETTY_PRINT)  --}}
