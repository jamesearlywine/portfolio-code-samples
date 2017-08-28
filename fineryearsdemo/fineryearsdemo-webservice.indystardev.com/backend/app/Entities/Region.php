<?php
namespace App\Entities;

use Kalnoy\Cruddy\Entity;

class Region extends Entity {

    /**
     * @var string
     */
    protected $model = \App\Models\ORM\Region::class;

    /**
     * The name of the column that is used to convert a model to a string.
     *
     * @var string
     */
    protected $titleAttribute = 'name';

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
        //$schema->string('id')->disable();
        $schema->string('name');
        $schema->timestamps(true, true);
    }
    

    /**
     * Define some columns.
     *
     * @param \Kalnoy\Cruddy\Schema\Columns\InstanceFactory $schema
     */
    public function columns($schema)
    {
        $schema->col('id');
        $schema->col('name');
     
    }   

    public function files($repo)
    {
        
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