<?php namespace App\Models\ORM;

use App\Models\S3Cache;
use Illuminate\Support\Facades\Config;


class CommunityAmenity extends BaseORM {

    public $timestamps  = false;

    protected $table    = 'community_amenities'; 
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
            }
        });
        static::deleted(function($model) {
            if (static::$updateS3OnSave) {
                static::generateApiCache();
            }
        });
    }
        
    /**
     * Relations
     */
    public function communities()     { return $this->belongsToMany('App\Models\ORM\Community', 'community_community_amenities'); }

    
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
        Community::generateApiCache();
    }


    /**
     * Clean Data
     */
    static public function cleanData($model)
    {
        
    }
    
}


