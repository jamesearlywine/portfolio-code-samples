<?php
use Intervention\Image\ImageManager;

/**
 * @brief   Class (stateless service) for generating thumbnails
 */
class ThumbnailService {

    protected static function makeThumbnail($original, $thumbnailTargetName) {
        static::init_service();
        /*
        $components = explode('.', $original);
        $extension  = array_pop($components);
        switch(strtolower($extension)) {
            case 'jpg':
            case 'jpeg':
                $format = IMAGETYPE_JPEG;
                break;
            case 'png':
                $format = IMAGETYPE_PNG;
                break;
            default:
                $format = IMAGETYPE_PNG;
        }
        */
        
        $factory = new ThumbnailFactory( new Factory() );
        $config = new \BoxUK\Obscura\ThumbnailFactory\Config();

        try {
            $config
                ->setInputFilename($original)
                ->setWidth($size)
                //->setImageType($format)
                ->setImageQuality(90)
                ->setOutputFilename($thumbnail)
                //->setMountColor(array(0,0,0,0))
            ;
            
            // config point
            $factory->setOutputDirectory(static::$baseFilePathToPublic);
            $_ENV['config'] = $config;
            
        } catch (Exception $ex) {
            echo PHP_EOL . "Error occurred in setting config: " . $ex;
        }
        
        /*
        echo PHP_EOL . "Config: " . print_r($config);
        die();
        */
        
        try {
            $filename = $factory->createThumbnail($config);
        }
        catch(BoxUK\Obscura\Exception $e) {
            //echo PHP_EOL . "Error occurred in processing: " . $original;
            echo PHP_EOL . "Error occurred in processing: " . $e;
        } catch (Exception $e) {
            echo PHP_EOL . "an error occured, this was the config: " . print_r($config, true);
            echo PHP_EOL . "This was the error: " . $e;
            die();
        }
        
        // if the thumbnail is larger than the original image
        if (filesize($filename) > filesize($original)) {
            // then let's just use the original image
            
                        if (ThumbnailService::$verbose_debug_reporting) {
                            echo "<div>Thumbnail (" . $size . ")px has larger filesize than original, using original instead</div>";
                            echo "<div>----------------------------------------------------------</div>";
                        }

            copy($original, $thumbnail);
            return $thumbnail;
        }
        
        return $filename;
    }
    
}
