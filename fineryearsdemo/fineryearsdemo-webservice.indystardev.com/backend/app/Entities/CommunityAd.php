<?php
namespace App\Entities;

use Kalnoy\Cruddy\Entity;

class CommunityAd extends Entity {

    /**
     * @var string
     */
    protected $model = \App\Models\ORM\CommunityAd::class;

    /**
     * The name of the column that is used to convert a model to a string.
     *
     * @var string
     */
    protected $titleAttribute = 'click-thru';

    /**
     * The name of the column that will sort data by default.
     *
     * @var string
     */
    protected $defaultOrder = 'click-thru';

    public $perPage = 300;

    /**
     * Define some fields.
     *
     * @param \Kalnoy\Cruddy\Schema\Fields\InstanceFactory $schema
     */
    public function fields($schema)
    {
        $schema->increments('id');
        //$schema->string('id')->disable();
        $schema->image('image_url')->width(150)->label('Image (300x250)');
        $schema->string('click_thru')->label('Click-thru URL');
        $schema->text('optional_html_instead')->label('Ad HTML to use instead (optional, ad-tag, etc)');
        $schema->timestamps(true, true);
        $schema->relates('community', 'communities');
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
        $schema->col('community');
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
            'image_url'
        ]);
        $l->row([
            'click_thru'
        ]);
        $l->row([
            'optional_html_instead'
        ]);
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

    
}