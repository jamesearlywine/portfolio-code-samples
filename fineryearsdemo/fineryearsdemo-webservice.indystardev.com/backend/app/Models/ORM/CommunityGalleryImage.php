<?php namespace App\Models\ORM;

use App\Models\S3Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class CommunityGalleryImage extends BaseORM {

    public $timestamps  = false;

	protected $table    = 'community_gallery_images'; 
    protected $guarded  = [];
    protected $hidden   = [];

    public static $updateS3OnSave = true;
    
    /**
     * Event registration
     */
    public static function boot()
    {
        parent::boot();
        static::saving(function($model) {
            static::cleanData($model);
            if (static::$updateS3OnSave) {
                // ..
            }
        });
        static::saved(function($model) {
            if (static::$updateS3OnSave) {
                $model->pushImageToS3();
                if (Config::get('s3.deleteImagesAfterCached')) { $model->removeLocalImage(); }
                //static::generateApiCache();
            }
            
        });
        static::deleted(function($model) {
            if (static::$updateS3OnSave) {
                $model->pushImageToS3();
                //static::generateApiCache();                
            }
        });
    }
        
    /**
     * Relations
     */
    public function gallery()    { return $this->belongsTo('App\Models\ORM\CommunityGallery'); }

    
    /**
     * toArray adjustments
     */
    public function toArray()
    {
        $arrData = parent::toArray();
        $arrData['s3_image_url']    = S3Cache::getUrlFor($arrData['image_url']);
        
        return $arrData;
    }
    
    
/**
 * CMS Stuff below
 */
    
    /**
     * Cache / S3 
     */
    // push community image to s3
    public function pushImageToS3()
    {
        $localFile = public_path( $this->image_url );
        if (file_exists($localFile)) {
            return S3Cache::storeImageFile(
                $localFile,
                Config::get('s3.imageCache') . '/' . $this->image_url
            );    
        }
        return null;   
    }
    public function removeLocalImage()
    {
        $localFile = public_path( $this->image_url );
        if (file_exists($localFile)) {
            Log::info('CommunityGallery removing local file: ' . $localFile);
            unlink($localFile);
        } else {
            Log::info('CommunityGallery could not remove local file, it does not exist: ' . $localFile);
        }
    }
    // generate relevant json fragments to s3 apiCache
    static public function generateApiCache()
    {
        // ...
    }


    /**
     * Clean Data
     */
    static public function cleanData($model)
    {
        
    }
    
}


