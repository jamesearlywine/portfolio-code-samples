<?php
namespace App\Entities;

use Kalnoy\Cruddy\Entity;

class Community extends Entity {

    /**
     * @var string
     */
    protected $model = \App\Models\ORM\Community::class;

    /**
     * The name of the column that is used to convert a model to a string.
     *
     * @var string
     */
    protected $titleAttribute = null;

    /**
     * The name of the column that will sort data by default.
     *
     * @var string
     */
    protected $defaultOrder = null;

    public $perPage = 300;

    /**
     * Define some fields.
     *
     * @param \Kalnoy\Cruddy\Schema\Fields\InstanceFactory $schema
     */
    public function fields($schema)
    {
        $schema->increments('id');
        $schema->string('id')->disable();
        $schema->string('name')->label('name');
        $schema->image('image_url')->width(150)->label('Image');
        $schema->string('address1') ->label('Address Line #1');
        $schema->string('address2') ->label('Address Line #2');
        $schema->string('city')     ->label('City');
        $schema->string('state')    ->label('State');
        $schema->string('zip')      ->label('Zip');
        $schema->string('lat')      ->label('Latitude')->disable();
        $schema->string('lng')      ->label('Longitude')->disable();
        $schema->string('phone')    ->label('Community Phone');
        // $schema->string('phone_ext')->label('Community Phone Ext.');
        // $schema->string('fax')      ->label('Fax');
        // $schema->string('fax_ext')  ->label('Fax Ext.');
        $schema->relates('regions', 'regions') ->label('Regions');
        $schema->string('email')    ->label('Community Email');
        $schema->string('website')  ->label('Website');
        $schema->relates('amenities', 'community_amenities') ->label('Amenities');
        $schema->embed('categoryMemberships', 'community_category_memberships')->label('Category Memberships');
        $schema->boolean('isApproved')->label('Approved?');
        $schema->boolean('isEnhanced')->label('Enhanced Listing?');
        $schema->string('facility_manager')->label('Community Contact');
        $schema->string('facility_manager_phone')->label('Community Contact Phone');
        $schema->string('facility_manager_email')->label('Community Contact Email');
        $schema->text('enhanced_intro_text')->label('Community Description');
        $schema->embed('gallery', 'community_galleries')->label('Community Image Gallery');
        
        $schema->embed('community_ad', 'community_ads')->label('Community Ad Unit (300x250)');
        
        $schema->string('submitter_name')->label('Name');
        $schema->string('submitter_phone')->label('Submitter Phone');
        $schema->string('submitter_email')->label('Submitter Email');
        
        $schema->string('enhanced_update_api_key')->label('Enhanced Update API Key');
        $schema->compute('enhancedUpdateURL', 'enhancedUpdateURL')->label('Enhanced Update URL');
        $schema->compute('enhancedPreviewURL', 'enhancedPreviewURL')->label('Enhanced Preview URL');
        
        $schema->timestamps(true, true);
        $schema->datetime('updated_at')->label('Last updated')->disable();
        
    }
    
    /**
     * Custom Layout
     */
     protected function layout($l)
     {
        $l->row([
            'id' 
        ]);
        $l->row([
            'name' 
        ]);
        $l->row([
            'image_url'
        ]);
        $l->row([
            'address1'
        ]);
        $l->row([
            'address2'
        ]);
        $l->row([
            [6, 'city'],
            [2, 'state'],
            [4, 'zip']
        ]);
        $l->row([
            'lat',
            'lng'
        ]);
        $l->row([
            'regions'
        ]);
        $l->row([
            [8, 'phone'],
            // [4, 'phone_ext']
        ]);
        /*
        $l->row([
            [8, 'fax'],
            [4, 'fax_ext']
        ]);
        */
        $l->row([
            'email'
        ]);
        $l->row([
            'website'
        ]);
        $l->row([
            'isApproved',
            'isEnhanced'
        ]);
        $l->row([
            'categoryMemberships'
        ]);
        
        $l->fieldset('Enhanced Listing Info', function($f) {
            $f->row([
                'amenities'
            ]);
            $f->row([
                'facility_manager',
            ]);
            $f->row([
                'facility_manager_phone',
                'facility_manager_email',
            ]);
            $f->row([
                'enhanced_intro_text'
            ]);
            $f->row([
                'gallery'
            ]);
            $f->row([
                'community_ad'
            ]);
            
        });
        $l->fieldset('Submitter Info', function($f) {
            $f->row([
                'submitter_name',
            ]);
            $f->row([
                'submitter_phone',
                'submitter_email'
            ]);
            
        });
        $l->row([
            'enhancedUpdateURL'
        ]);
        $l->row([
            'enhancedPreviewURL'
        ]);
        $l->row([
            'updated_at'
        ]);
        
     }
     

    /**
     * Define some columns.
     *
     * @param \Kalnoy\Cruddy\Schema\Columns\InstanceFactory $schema
     */
    public function columns($schema)
    {
        $schema->col('id');
        $schema->col('image_url')->format('Image', ['height' => 70]);
        $schema->col('name');
        $schema->col('city');
        $schema->col('zip');
        $schema->col('isApproved');
        $schema->col('isEnhanced');
        $schema->col('submitter_email');
        $schema->col('updated_at');
    }   

    public function files($repo)
    {
        $repo->uploads('image_url')->to('community_images');
    }

    /**
     * Define validation rules.
     *
     * @param \Kalnoy\Cruddy\Service\Validation\FluentValidator $v
     */
    public function rules($v)
    {
        $v->always([

        ]);
    }
    
    
    
    public function toString($model)
    {
        return $model->name;
    }
    
    
    public function toHTML($model)
    {
        return '<img src="' 
                    . asset('admincms/_thumb?src=' 
                        . urlencode($model->team_logo_public_filename) 
                        . '&amp;width=40&amp;height=70'
                    ) 
                    . '"  width="20" height="35" style=""> ' 
                    . $model->getFullName()
        ;
    }
    
    
}