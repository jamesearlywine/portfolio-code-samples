<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>The Finer Years: Request for more information</title>
  </head>
  <body>
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
                                            <td style="padding:5px; vertical-align:top;">Sent from <a href="http://www.fineryears.com" target="_blank">The Finer Years: Retirement Living and Elder Care</a></td>
                                          </tr>
                                        </table>
                                        
                                        <!-- COMMUNITY INFORMATION -->
                                        <table align="center" style="width:95%; margin:0 auto 0 auto;">
                                          <tr>
                                            <th colspan="2" style="color:#105363; padding:5px; background-color:#f6d882; text-align:center;">REQUEST FOR MORE INFORMATION</th>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Name:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$request['name']}}</td>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Email:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$request['email']}}</td>
                                          </tr>
                                          <tr style="background-color:#EEEEEE;">
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Phone:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$request['phone']}}</td>
                                          </tr>
                                          <tr>
                                            <td style="font-weight:bold; width:90px; padding:5px; vertical-align:top;">Message:</td>
                                            <td style="padding:5px; vertical-align:top;">{{$request['message']}}</td>
                                          </tr>
                                        </table>
                                        
                                        <!-- OTHER INFORMATION -->
                                        <table align="center" style="width:95%; margin:0 auto 0 auto;">
                                          <tr>
                                            <td style="padding:5px; vertical-align:top;">For questions, please contact <b>Jason LaPaglia</b> at <a href="mailto:jason.lapaglia@indystar.com" target="_self" style="border:none;">jason.lapaglia@indystar.com</a> or call 317-444-7058.</td>
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
{{-- json_encode($request, JSON_PRETTY_PRINT)    --}}
