<?php namespace App\Models\ORM;

use App\Models\S3Cache;
use Illuminate\Support\Facades\Config;


class CommunityAd extends BaseORM {

    public $timestamps  = false;

	protected $table    = 'community_ads'; 
    protected $guarded  = [];
    protected $hidden   = [
        'pivot',
        //'id'
    ];

    protected $with     = [
         
    ];

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
                static::generateApiCache();
                $model->pushImageToS3();
            }
        });
        static::deleted(function($model) {
            if (static::$updateS3OnSave) {
                $model->pushImageToS3();
                static::generateApiCache();
            }
        });
    }
        
    /**
     * Relations
     */
    public function community()     { return $this->belongsTo('App\Models\ORM\Community'); }

    
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
        $localFile = public_path(    $this->image_url );
        if (file_exists($localFile)) {
            return S3Cache::storeImageFile(
                $localFile,
                Config::get('s3.imageCache') . '/' . $this->image_url
            );    
        } 
        return null;
    }
    // generate relevant json fragments to s3 apiCache
    static public function generateApiCache()
    {
        // ...
        Community::generateApiCache();
    }


    /**
     * Clean Data
     */
    static public function cleanData($model)
    {
        static::cleanClickThru($model);
    }
    static public function cleanClickThru($model)
    {
        $model->click_thru = preg_replace('#^https?://#', '', $model->click_thru);
    }
    
    
}


