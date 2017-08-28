<?php namespace App\Models;

use AWS;
use Illuminate\Support\Facades\Config;

class S3Cache {

    public static function storeContents($contents)
    {
        $s3Responses = [];
        foreach ($contents as $location => $content) {
            $s3Response = static::storeContent($content, $location);
            array_push($s3Responses, $s3Response);
        }
        return $s3Responses;
    }
    public static function storeContent($content, $location)
    {
        return static::s3Client()
            ->putObject([
                'Bucket'        => Config::get('s3.s3Bucket'),
                'Key'           => $location,
                'Body'          => $content,
                'ACL'    	    => 'public-read',
                'ContentType'   => 'application/json'
            ])
        ;
    }
    
    public static function storeContentsGzipped($contents)
    {
        $s3Responses = [];
        foreach ($contents as $location => $content) {
            $s3Response = static::storeContentGzipped($content, $location);
            array_push($s3Responses, $s3Response);
        }
        return $s3Responses;
    }
    public static function storeContentGzipped($content, $location)
    {
        $gzippedContent = gzencode($content);
        return static::s3Client()
            ->putObject([
                'Bucket'            => Config::get('s3.s3Bucket'),
                'Key'               => $location,
                'Body'              => $gzippedContent,
                'ACL'    	        => 'public-read',
                'ContentType'       => 'application/json',
                'ContentEncoding'   => 'gzip'
            ])
        ;
    }
    
    public static function storeFiles($files)
    {
        $s3Responses = [];
        foreach ($files as $location => $file) {
            $s3Response = static::storeFile($file, $location);
            array_push($s3Responses, $s3Response);
        }
        return $s3Responses;
    }
    public static function storeFile($localFilePath, $location, $contentType = null)
    {
        if (empty($localFilePath) 
            || is_null($localFilePath) 
            || !file_exists($localFilePath)
            || is_dir($localFilePath)
        ) {return null;}
        $s3Object = [
            'Bucket'        => Config::get('s3.s3Bucket'),
            'Key'           => $location,
            'SourceFile'    => $localFilePath,
            'ACL'    	    => 'public-read',
            'ContentType'   => $contentType
        ];

        return static::s3Client()
            ->putObject($s3Object)
        ;
    }
    public static function storeImageFiles($files) 
    {
        $s3Responses = [];
        foreach ($files as $location => $file) {
            $s3Response = static::storeImageFile($file, $location);
            array_push($s3Responses, $s3Response);
        }
        return $s3Responses;
    }
    public static function storeImageFile($file, $location)
    {
        $contentType = 'image';
        if ( strpos( strtolower($file), '.png' ) !== false) {$contentType = 'image/png';}
        if ( strpos( strtolower($file), '.jpg' ) !== false) {$contentType = 'image/jpg';}
        if ( strpos( strtolower($file), '.jpeg' ) !== false) {$contentType = 'image/jpg';}
        if ( strpos( strtolower($file), '.gif' ) !== false) {$contentType = 'image/gif';}
        if ( strpos( strtolower($file), '.bmp' ) !== false) {$contentType = 'image/bmp';}
        
        return static::storeFile($file, $location, $contentType);
    }
    
    public static function getUrlFor($src) {
        if ( empty(trim($src)) ) {return null;}
        $bucketPrefix       = Config::get('s3.bucketUrl');
        $imageCachePrefix   = Config::get('s3.imageCache');
        $Url = rtrim($bucketPrefix, '/') . '/' . $imageCachePrefix . '/' . $src;
        return $Url;
    }
    
    
    /**
     * Singleton pattern for s3Client
     */
    public static $s3Client = null;
    public static function s3Client()
    {
        if (is_null(static::$s3Client)) { static::$s3Client = AWS::createClient('s3'); }
        return static::$s3Client;
    }
    
}

