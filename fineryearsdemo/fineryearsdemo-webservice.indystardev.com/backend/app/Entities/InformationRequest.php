<?php
namespace App\Entities;

use Kalnoy\Cruddy\Entity;

class InformationRequest extends Entity {

    /**
     * @var string
     */
    protected $model = \App\Models\ORM\InformationRequest::class;

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
    protected $defaultOrder = 'name';

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
        $schema->string('name')->label('Name');
        $schema->string('email')->label('Email');
        $schema->string('phone')->label('Phone');
        $schema->text('message')->label('Message');
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
        $schema->col('email');
        $schema->col('phone');
        
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