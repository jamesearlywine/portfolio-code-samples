<?php
namespace App\Entities;

use Kalnoy\Cruddy\Entity;

class CommunityGalleryImage extends Entity {

    /**
     * @var string
     */
    protected $model = \App\Models\ORM\CommunityGalleryImage::class;

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
        $schema->image('image_url')->width(150)->label('Image');
        $schema->text('description') ->label('Description');
        
        $schema->timestamps(true, true);

    }
    
    /**
     * Custom Layout
     */
    protected function layout($l)
    {
        $l->row([
            [3, 'image_url'],
            [9, 'description']
        ]);
    }
    
    
    /**
     * Define some columns.
     *
     * @param \Kalnoy\Cruddy\Schema\Columns\InstanceFactory $schema
     */
    public function columns($schema)
    {
        //$schema->col('id');
        $schema->col('image_url')->format('Image', ['height' => 70]);
        $schema->col('description');
    }   

    public function files($repo)
    {
        $repo->uploads('image_url')->to('community_gallery_images');
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
    
    
    /*
    public function toString($model)
    {
        return $model->description;
    }
    
    
    public function toHTML($model)
    {
        return '<img src="' 
                    . asset('admincms/_thumb?src=' 
                        . urlencode($model->image_url) 
                        . '&amp;width=40&amp;height=70'
                    ) 
                    . '"  width="20" height="35" style=""> ' 
        ;
    }
    */
    
}