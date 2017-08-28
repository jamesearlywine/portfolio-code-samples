<?php namespace App\Models\ORM;

use App\Models\S3Cache;
use Illuminate\Support\Facades\Config;


class CommunityGallery extends BaseORM {

    public $timestamps  = false;

	protected $table    = 'community_galleries'; 
    protected $guarded  = [];
    protected $hidden   = [];

    protected $with     = [
        'images'  
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
                //static::generateApiCache();
            }
        });
        static::deleted(function($model) {
            if (static::$updateS3OnSave) {
                //static::generateApiCache();
            }
        });
    }
        
    /**
     * Relations
     */
    public function community()     { return $this->belongsTo('App\Models\ORM\Community'); }
    public function images()        { return $this->hasMany('App\Models\ORM\CommunityGalleryImage'); }
    
    
    /**
     * toArray adjustments
     */
    public function toArray()
    {
        $arrData = parent::toArray();
        
        return $arrData;
    }
    
    
/**
 * CMS Stuff below
 */
    
    /**
     * Cache / S3 
     */
    // push community image to s3
    public function pushImagesToS3()
    {
        
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


