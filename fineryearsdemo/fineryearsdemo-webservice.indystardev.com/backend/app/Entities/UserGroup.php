<?php
namespace App\Entities;

use Kalnoy\Cruddy\Schema\BaseSchema;
use Kalnoy\Cruddy\Service\Validation\FluentValidator;

class UserGroup extends BaseSchema {

    protected $model = 'App\Models\ORM\UserGroup';

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

    protected $perPage = 100;
    
    /**
     * Define some fields.
     *
     * @param $schema
     */
    public function fields($schema)
    {
        $schema->increments('id');
        $schema->string('name')->required();
        $schema->text('permissions');
        //$schema->code('permissions')->mode('js')->height(150);
        //$schema->text('permissions');
        //$schema->timestamps(false);
    }

    /**
     * Define some columns.
     *
     * @param $schema
     */
    public function columns($schema)
    {
        $schema->col('id');
        $schema->col('name');
        $schema->col('permissions');
        
    }

    /**
     * Define some files to upload.
     *
     * @param $repo
     */
    public function files($repo)
    {

    }

    /**
     * Define validation rules.
     *
     * @param $v
     */
    public function rules($v)
    {
        $v->rules(
        [

        ]);
    }
}