<?php namespace App\Models\ORM;

use App\Models\S3Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Utils\Random;
use App\Models\Utils\FilenameGenerator;

// https://github.com/geocoder-php/GeocoderLaravel
// http://geocoder-php.org/Geocoder/
use Geocoder\Laravel\Facades\Geocoder;


class Community extends BaseORM {

	protected $table    = 'communities'; 
    protected $guarded  = [];
    protected $hidden   = [
        'created_at',
        'updated_at',
        'enhanced_update_api_key'
    ];
    protected $with = [
        'gallery',
        'amenities',
        'categoryMemberships',
        'regions',
        'community_ad'
    ];
    
    public static $updateS3OnSave = true;
    
    public static $EVENT_HANDLING_ENABLED = true;
    
    public static $INCLUDE_IS_FAVORITED = true;
    
    /**
     * Event registration
     */
    public static function boot()
    {
        parent::boot();
        static::saving(function($model) {
            if (!static::$EVENT_HANDLING_ENABLED) {return false;}
            // if an enhanced update api key has not yet been generated, generate one
            if (empty($model->enhanced_update_api_key)) { static::generateEnhancedUpdateApiKey($model); }
            static::cleanData($model);
            static::geocode($model);
            if (static::$updateS3OnSave) {
                $model->pushImageToS3();
                if (Config::get('s3.deleteImagesAfterCached')) { $model->removeLocalImage(); }
                $model->generateThumbnail();
                $model->pushThumbnailToS3();
                if (Config::get('s3.deleteImagesAfterCached')) { $model->removeLocalThumbnail(); }
            }
            
        });
        static::saved(function($model) {
            if (!static::$EVENT_HANDLING_ENABLED) {return false;}
            if (static::$updateS3OnSave) {
                static::generateApiCache([
                    'model'             => $model,
                    'withAggregateData' => true
                ]);
            }
        });
        static::deleted(function($model) {
            if (!static::$EVENT_HANDLING_ENABLED) {return false;}
            if (static::$updateS3OnSave) {
                static::generateApiCache([
                    'model'             => $model,
                    'withAggregateData' => true
                ]);
            }
        });
    }
        
    /**
     * Relations
     */
    public function gallery()   { return $this->hasOne('App\Models\ORM\CommunityGallery'); }
    public function amenities() { return $this->belongsToMany( '\App\Models\ORM\CommunityAmenity', 'community_community_amenities'); }
    public function informationRequests() { return $this->hasMany( '\App\Models\ORM\InformationRequest'); }
    public function regions()   { return $this->belongsToMany( '\App\Models\ORM\Region'); }
    public function categoryMemberships() { return $this->hasMany('App\Models\ORM\CommunityCategoryMembership'); }
    public function guestUsersFavorites() { return $this->hasMany('App\Models\ORM\GuestUser', 'guest_user_favorite_communities'); }
    public function community_ad()        { return $this->hasOne('App\Models\ORM\CommunityAd'); }

    /**
     * Misc
     */
    public static function tableName()
    {
        $model = new static();
        return $model->getTableName();
    }
    public function getTableName() { return $this->table; }
    public static function citiesAndZips()
    {
        $citiesAndZips = [
            'cities'    => static::cities(),
            'zips'      => static::zips()
        ];
        return $citiesAndZips;
    }
    public static function cities()
    {
        $results = DB::table(static::tableName())
                    ->select('city')
                    ->groupBy('city')
                    ->orderBy('city')
                    ->where('isApproved', '!=', false)
                    ->get()
        ;
        $cities = [];
        foreach ($results as $result) {
            array_push($cities, $result->city);
        }
        return $cities;
    }
    public static function zips()
    {
        $results = DB::table(static::tableName())
                    ->select('zip')
                    ->groupBy('zip')
                    ->orderBy('zip')
                    ->where('isApproved', '!=', false)
                    ->get()
        ;
        $zips = [];
        foreach ($results as $result) {
            array_push($zips, $result->zip);
        }
        return $zips;
    }

    /**
     * toArray adjustments
     */
    public function toArray()
    {
        $arrData = parent::toArray();
        $arrData['isEnhanced']      = $arrData['isEnhanced'] === '1' ? true : false;
        $arrData['isApproved']      = $arrData['isApproved'] === '1' ? true : false;
        
        $guestUser = Session::get('GuestUser', null);
        
        if (static::$INCLUDE_IS_FAVORITED) {
            if ( !is_null($guestUser) && is_array($guestUser['favorite_communities']) ) {
                $arrData['isFavorited'] = in_array($this->id, $guestUser['favorite_communities']);
            } else {
                $arrData['isFavorited'] = false;
            }
        }
        
        $arrData['s3_image_url']            = S3Cache::getUrlFor($arrData['image_url']);
        $arrData['s3_image_thumbnail_url']  = S3Cache::getUrlFor($arrData['image_thumbnail_url']);
        
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
        if (empty($this->image_url)) {return;}
        $localFile = public_path(    $this->image_url );
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
        if ( file_exists($localFile) && !empty($this->image_url) ) {
            unlink($localFile);
        }
    }
    
    // generate relevant json fragments to s3 apiCache
    static public function generateApiCache($options = [])
    {
        // ...
        static::$INCLUDE_IS_FAVORITED = false;
        if (!empty($options['model']))              { $options['model']->pushApiCacheToS3(); }
        if (!isset($options['withAggregateData']))  { $options['withAggregateData'] = true;  }
        if ($options['withAggregateData'])          { static::pushAggregateDataToS3();       }
        static::$INCLUDE_IS_FAVORITED = true;
    }
    static public function pushAggregateDataToS3()
    {
        $webserviceCache = Config::get('s3.webserviceCache');
        $apiContents = [
            $webserviceCache . '/community.json'                => static::all()->toJson(),
            $webserviceCache . '/amenity.json'                  => CommunityAmenity::all()->toJson(),
            $webserviceCache . '/region.json'                   => Region::all()->toJson(),
            $webserviceCache . '/communityCitiesAndZips.json'   => json_encode(static::citiesAndZips())
        ];
        $s3Responses = S3Cache::storeContentsGzipped($apiContents);
        return $s3Responses;
    }
    public function pushAPICacheToS3()
    {
        // not storing communities individually at this point
        // entire data payload loads currently..
    }
    
    /**
     * Thumbnails
     */
    public function generateThumbnail()
    {
            
            $subfolder      = 'community_images/';
            $extension      = 'jpeg';
            $newFilename    = FilenameGenerator::random(10, true, $extension);
            $newFilepath    = public_path( $subfolder );

            $thumbnailFilename = $subfolder . $newFilename;
            $thumbnailFullFilename = $newFilepath . $newFilename;
            
            $s3ImageUrl = S3Cache::getUrlFor($this->image_url);
            if (is_null($s3ImageUrl)) {
                return;
            }
            try {
                $thumbnailImage = \Image::make($s3ImageUrl);
            } catch (Exception $e) {
                return;
            }
            
            $thumbnailImage->resize(
                Config::get('thumbnails.communities.width'),
                Config::get('thumbnails.communities.height'),
                function($constraint) {
                    if (Config::get('thumbnails.communities.preserveAspectRation')) {
                        $constraint->aspectRatio();
                    }
                    if (Config::get('thumbnails.communities.preventUpsizing')) {
                        $constraint->upsize();
                    }
                }
            );
            
            $thumbnailImage->save($thumbnailFullFilename, Config::get('thumbnails.communities.jpgQuality'));
            $this->image_thumbnail_url = $thumbnailFilename;
    }
    public function pushThumbnailToS3()
    {
        if (empty($this->image_thumbnail_url)) {
            return;
        }
        $localFile = public_path(    $this->image_thumbnail_url );
        if (file_exists($localFile)) {
            return S3Cache::storeImageFile(
                $localFile,
                Config::get('s3.imageCache') . '/' . $this->image_thumbnail_url
            );    
        } 
        
        return null;        
    }
    public function removeLocalThumbnail()
    {
        $localFile = public_path( $this->image_thumbnail_url );
        if ( file_exists($localFile) && !empty($this->image_thumbnail_url) ) {
            unlink($localFile);
        } 
    }

    /**
     * Clean Data
     */
    static public function cleanData($model)
    {
        static::cleanPhone($model);
        static::cleanWebsite($model);
    }
    static public function cleanPhone($model)
    {
        $model->phone       = preg_replace("/[^0-9,.]/", "", $model->phone);
        $model->phone_ext   = preg_replace("/[^0-9,.]/", "", $model->phone_ext);
        $model->fax         = preg_replace("/[^0-9,.]/", "", $model->fax);
        $model->fax_ext     = preg_replace("/[^0-9,.]/", "", $model->fax_ext);
        $model->submitter_phone         = preg_replace("/[^0-9,.]/", "", $model->submitter_phone);
        $model->facility_manager_phone  = preg_replace("/[^0-9,.]/", "", $model->facility_manager_phone);
        
    }
    static public function cleanWebsite($model)
    {
        $model->website = preg_replace('#^https?://#', '', $model->website);
    }
    
    /**
     * Geocoding
     */
    static public function geocode($model)
    {
        $address    = $model->address1
                    . ','
                    . $model->city
                    . ' '
                    . $model->state
                    . ' '
                    . $model->zip
        ;
        
        if (empty(trim(str_replace(',', '', $address)))) {return;}
        $address = trim($address);
        $geocoded = Geocoder::geocode($address)->get()->first();
        $model->lat = $geocoded->getLatitude();
        $model->lng = $geocoded->getLongitude();
    }
    
    
    /**
     * Community Submission formData (advertise with us)
     */
    public static function createFromAdvertiseFormSubmission($formData)
    {
        
        // determine where the community image will be stored (before push to s3)
        if ( !empty($formData['image']) ) {
            $subfolder      = 'community_images/';
            $extension      = $formData['image']->getClientOriginalExtension();
            $newFilename    = FilenameGenerator::random(10, true, $extension);
            $newFilepath    = public_path( $subfolder );
            
            // move the uploaded file to the correct location
            $formData['image']->move($newFilepath, $newFilename);
            
            // update info for storing in the database (under public_path)
            $formData['image_url'] = $subfolder . $newFilename;
        } else {
            $formData['image_url'] = null;
        }
        unset($formData['image']);
        
        // prep regions
        if (empty($formData['regions'])) {
            $regions = [];
        } else {
            $regions = explode(',', $formData['regions']);
            $regions = array_map('trim', $regions);
        }
        unset($formData['regions']);
        
        // prep categories
        if (empty($formData['communityCategories'])) {
            $categories = [];
        } else {
            $categories = explode(',', $formData['communityCategories']);
            $categories = array_map('trim', $categories);
        
        }
        unset($formData['communityCategories']);

        // defaults that may not be specified by the user
        $formData['isEnhanced']             = false;
        $formData['isApproved']             = false;
        // $formData['facility_manager']       = null;
        $formData['enhanced_intro_text']    = null;
        
        $newCommunity = static::create($formData);
        
        // attach to regions
        foreach ($regions as $region_id) {
            $newCommunity->regions()->attach($region_id);   
        }
        
        // category memberships
        foreach ($categories as $category_id) {
            CommunityCategoryMembership::create([
                'community_id'  => $newCommunity->id,
                'category_id'   => $category_id,
                'description'   => null
            ]);
        }
        
        $freshlyLoaded = static::find($newCommunity->id);

        return $freshlyLoaded;
    }
     
    /**
     * Community Enhanced Update Submission formData 
     */
    public static function enhancedUpdateFormSubmission($formData, $existingCommunity)
    {

        /**
         * Simple field map
         */
        $existingCommunity->name                    = $formData['name'];
        $existingCommunity->address1                = $formData['address1'];
        $existingCommunity->address2                = $formData['address2'];
        $existingCommunity->city                    = $formData['city'];
        $existingCommunity->state                   = $formData['state'];
        $existingCommunity->zip                     = $formData['zip'];
        $existingCommunity->phone                   = $formData['phone'];
        $existingCommunity->email                   = $formData['email'];
        $existingCommunity->website                 = $formData['website'];
        $existingCommunity->enhanced_intro_text     = $formData['enhanced_intro_text'];
        $existingCommunity->facility_manager        = $formData['facility_manager'];
        $existingCommunity->facility_manager_email  = $formData['facility_manager_email'];
        $existingCommunity->facility_manager_phone  = $formData['facility_manager_phone'];
        $existingCommunity->submitter_name          = $formData['submitter_name'];
        $existingCommunity->submitter_email         = $formData['submitter_email'];
        $existingCommunity->submitter_phone         = $formData['submitter_phone'];

        /**
         * Community Image
         */
        // mutates formData
        static::_enhancedUpdateFormSubmission_preProcessImage($formData);
        // if an image was uploaded
        if (!empty($formData['image'])) {
            $existingCommunity->image_url = $formData['image_url'];
        } else { // otherwise..
            $existingCommunity->image_url   = !empty($formData['imageData'])
                                            ? $formData['imageData']->image_url
                                            : null
            ;
        }
        
        
        /**
         * Gallery Images - does not mutate formData
         */
        // does not mutate formData
        $galleryImages = static::_enhancedUpdateFormSubmission_preProcessGalleryImages($formData);
        // transform all images into their eloquent equivalent
        $ormGalleryImages = [];
        foreach ($galleryImages as $key => $galleryImage) {
            $ormGalleryImages[$key]    = ( empty($galleryImage['id']) ) 
                                    ? new CommunityGalleryImage($galleryImage)
                                    : CommunityGalleryImage::find($galleryImage['id'])
            ;
        }
        // save them to the photo gallery for this community
            // create empty gallery if no gallery exists for this community
            if (empty($existingCommunity->gallery)) {
                $existingCommunity->gallery()->save(
                    new CommunityGallery(['community_id' => $existingCommunity])
                );
            }
            
        $gallery = $existingCommunity->gallery()->first();

        foreach ($ormGalleryImages as $galleryImage) {
            if (!is_null($galleryImage)) {
                $gallery->images()->save($galleryImage);
            }
        }
        // remove any stored gallery images that are not in the submitted images (form submits entire image set)
        $submittedImageIDs = array_pluck($ormGalleryImages, 'id');
        foreach ($gallery->images as $image) {
            if ( !in_array($image->id, $submittedImageIDs) ) {
                $image->delete();
            }
        }
        
        /**
         * Regions
         */
        if (empty($formData['regions'])) {
            $regions = [];
        } else {
            $regions = explode(',', $formData['regions']);
            $regions = array_map('trim', $regions);
        }
        $existingCommunity->regions()->detach();
        $existingCommunity->regions()->attach($regions);

        /**
         * Category Memberships
         */
        // add or update all submitted category memberships
        $ormCategoryMemberships = [];
        foreach ($formData['communityCategories'] as $key => $categoryMembership) {
            
            $existingCategoryMembership = 
                CommunityCategoryMembership::where('community_id', $existingCommunity->id)
                    ->where('category_id', $categoryMembership->id)
                    ->first()
            ;
            $ormCategoryMemberships[$key] = ( empty($existingCategoryMembership) )
                                    ? new CommunityCategoryMembership()
                                    : $existingCategoryMembership
            ;
            
            $ormCategoryMemberships[$key]->description  = $categoryMembership->description;
            $ormCategoryMemberships[$key]->category_id  = $categoryMembership->id;
            $ormCategoryMemberships[$key]->community_id = $existingCommunity->id;
            $existingCommunity->categoryMemberships()->save($ormCategoryMemberships[$key]);
        }
        // remove any category memberships that were not submitted (form submits entire set)
        $submittedCategoryIDs = array_pluck($ormCategoryMemberships, 'category_id');
        foreach ($existingCommunity->categoryMemberships as $existingCategoryMembership)
        {
            if ( !in_array($existingCategoryMembership->category_id, $submittedCategoryIDs) ) {
                $existingCategoryMembership->delete();
            }
        }


      
        /**
         * Amenities
         */
        $existingCommunity->amenities()->detach();
        foreach ($formData['amenities'] as $key => $amenity) {
            $ormAmenity = is_null($amenity->id)
                        ?   CommunityAmenity::create([
                                'name'              => $amenity->name,
                                'show_in_dropdowns' => false
                            ])
                        :   CommunityAmenity::find($amenity->id)
            ;
            $ormAmenities[$key] = $ormAmenity;
            $existingCommunity->amenities()->attach($ormAmenity);
        }


        
        /* breakpoint
        $existingCommunity->save();
        $existingCommunity = static::find($existingCommunity->id);
        echo json_encode([
            'formData'          => $formData,
            'existingCommunity' => $existingCommunity
        ]);
        die();
        */
        
        $existingCommunity->save();
        $freshlyLoaded = static::find($existingCommunity->id);

        return $freshlyLoaded;
    }
    public static function _enhancedUpdateFormSubmission_preProcessImage(&$formData)
    {
        if ( !empty($formData['image']) ) {
            $subfolder      = 'community_images/';
            $extension      = $formData['image']->getClientOriginalExtension();
            $newFilename    = FilenameGenerator::random(10, true, $extension);
            $newFilepath    = public_path( $subfolder );
            
            // move the uploaded file to the correct location
            $formData['image']->move($newFilepath, $newFilename);
            
            // update info for storing in the database (under public_path)
            $formData['image_url'] = $subfolder . $newFilename;
            $formData['imageWasUploaded'] = true;
        } else {
            $formData['image_url'] = null;
            $formData['imageWasUploaded'] = false;
        }
    }
    public static function _enhancedUpdateFormSubmission_preProcessGalleryImages($formData)
    {
        // pre-process all the gallery image files before creation (file move mostly)
        $galleryImages = [];
        
        foreach ($formData['galleryImagesData'] as $key => $galleryImageData) {
            $fileKey    = 'galleryImageFiles_' . $key;
            // if there is a file, move it
            if (!empty($formData[$fileKey])) {
                $file           = $formData[$fileKey];
                $subfolder      = 'community_images/';
                $extension      = $file->getClientOriginalExtension();
                $newFilename    = FilenameGenerator::random(10, true, $extension);
                $newFilepath    = public_path( $subfolder );
                $image_url      = $subfolder . $newFilename;
                
                $file->move($newFilepath, $newFilename);
            } else {
                $image_url  = !empty($galleryImageData->image_url) 
                            ? $galleryImageData->image_url
                            : null
                ;
            }
            
            array_push($galleryImages, 
                [
                    'image_url'     => $image_url,
                    'description'   => ( !empty($galleryImageData->description) )
                                        ? $galleryImageData->description
                                        : null
                                    ,
                    'id'            => ( !empty($galleryImageData->id) )
                                        ? $galleryImageData->id
                                        : null
                                    ,
                    // 'isNew'         => empty($galleryImageData->id)
                ]
            );
        }
        
        return $galleryImages;
    }





    /**
     * Enhanced Update Stuff
     */
    // decorate model with fresh enhanced_update_api_key
    public static function generateEnhancedUpdateApiKey($model, $save = false)
    {
        $model->enhanced_update_api_key = static::_generateEnhancedUpdateApiKey();
        if ($save) {$model->save();}
    }
    // Returns an enhanced_update_api_key that is gauranteed to be unique
    public static function _generateEnhancedUpdateApiKey()
    {
        $randomKey = static::randomKey();
        if (!is_null(
                static::where('enhanced_update_api_key', $randomKey)->first()
            )) 
        {
            return static::generateApiKey();
        } else {
            return $randomKey;
        }
    }
    
    public function enhancedUpdateURL($asLink = true)
    {
        $url = env('WEB_URL', null) 
                . '/advertise/#/enhanced?key=' 
                . rawurlencode($this->enhanced_update_api_key)
        ;    
        if ($asLink) {
            return "<a href=\"$url\" target=\"blank\">$url</a>";
        } else {
            return $url;
        }
        
    }
    public function enhancedPreviewURL($asLink = true)
    {
        $url = env('WEB_URL', null) 
                . '/preview/#/community/' 
                . rawurlencode($this->id)
        ;    
        if ($asLink) {
            return "<a href=\"$url\" target=\"blank\">$url</a>";
        } else {
            return $url;
        }
        
    }
    public function enhancedViewURL($asLink = true)
    {
        $url = env('WEB_URL', null) 
                . '/#/community/' 
                . rawurlencode($this->id)
        ;    
        if ($asLink) {
            return "<a href=\"$url\" target=\"blank\">$url</a>";
        } else {
            return $url;
        }
        
    }
    
    
    
    public static function randomKey()
    {
        return Random::chars([
            'numChars'      => 70,
            'validChars'    => 'abcdefghijklmnopqrstuvwxyzABCDEFGHJIJKLMNOPQRSTUVWXYZ1234567890',
            'allowRepeat'   => true,
            'timestamp'     => false,
            'delimeter'     => '.'
        ]);
    }
    
    public static function byEnhancedUpdateApiKey($enhancedUpdateApiKey) {
        return static::where('enhanced_update_api_key', $enhancedUpdateApiKey)
                ->first()
        ;
    }
    
    
}


