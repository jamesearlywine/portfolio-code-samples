<?php namespace App\Models\ORM;


class InformationRequest extends BaseORM {

    public $timestamps  = false;

    protected $table    = 'information_requests'; 
    protected $guarded  = [];
    protected $hidden   = [
        //'pivot',
        //'id'
    ];

    protected $with     = [
        'community'
    ];

    public static $updateS3OnSave = false;
    
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
    public function community()     { return $this->belongsTo('App\Models\ORM\Community'); }

    
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


