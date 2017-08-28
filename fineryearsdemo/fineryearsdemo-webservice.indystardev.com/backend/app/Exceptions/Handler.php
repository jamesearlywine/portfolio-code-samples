<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        // AuthorizationException::class,
        // HttpException::class,
        // ModelNotFoundException::class,
        // ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $e
     * @return void
     */
    public function report(Exception $e)
    {
        parent::report($e);
        
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    {
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            return Response::json([
                'error' => 'endpoint not found.'
            ], 404);
        }
        
        /*
        var_dump($e);
        die();
        */
        
        /*
        if ( (   $e instanceof \Symfony\Component\HttpKernel\Exception
              || $e instanceof \ErrorException
              || $e instanceof \Symfony\Component\Debug\Exception\FatalErrorException
              || $e instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException
              || $e instanceof \BadMethodCallException
             ) && ( 
                 1 == 1
                 // $request->wantsJson() 
                 )
        ) {
            return Response::json( [
                'error' => [
                    'exception' => class_basename( $e ) . ' in ' . basename( $e->getFile() ) . ' line ' . $e->getLine() . ': ' . $e->getMessage(),
                ]
            ], 500 );
        }
        
        */
        
        if ($e instanceof HttpResponseException) {
            return $e->getResponse();
        } elseif ($e instanceof ModelNotFoundException) {
            $e = new NotFoundHttpException($e->getMessage(), $e);
        } elseif ($e instanceof AuthorizationException) {
            $e = new HttpException(403, $e->getMessage());
        } elseif ($e instanceof ValidationException && $e->getResponse()) {
            return $e->getResponse();
        }

        /* Handle SecurityExceptions (thrown by Entrust middleware) */
        if ($e instanceof SecurityException) {
            $user = Auth::user();
            if (!empty($user)) { $user->load('roles.permissions'); }
            return Response::json([
                'error' => $e->getMessage(),
                'user'  => $user
            ], 403);
        }

        if ($this->isHttpException($e)) {
            return Response::json( [
                    'error' => [
                        'exception' => class_basename( $e ) . ' in ' . basename( $e->getFile() ) . ' line ' . $e->getLine() . ': ' . $e->getMessage(),
                    ]
                ], 500 )
            ;
            
            //return $this->toIlluminateResponse($this->renderHttpException($e), $e);
        } else {
            return Response::json( [
                    'error' => [
                        'exception' => class_basename( $e ) . ' in ' . basename( $e->getFile() ) . ' line ' . $e->getLine() . ': ' . $e->getMessage(),
                    ]
                ], 500 )
            ;
            
            //die(); // don't show the big lengthy html stuff
            return $this->toIlluminateResponse($this->convertExceptionToResponse($e), $e);
        }


    }
}
