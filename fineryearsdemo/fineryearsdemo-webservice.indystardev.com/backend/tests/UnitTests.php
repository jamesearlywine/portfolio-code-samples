<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

use Illuminate\Support\Facades\File;
use App\Models\Utils\CSV;
use App\Models\Utils\FilenameGenerator;

/**
 * @brief   Unit tests to ensure the backend components are working
 */
class UnitTests extends TestCase
{
    /**
     * @brief   Unit - Test App\Utils\CSV::fromFilePath 
     * @return void
     */
    public function test__App_Utils_CSV__fromFilePath__produces_expected_data_object()
    {
        // create a csv file 
        $filepath   = storage_path('tests/test.csv');
        $contents   = 'columnA,columnB,columnC' . PHP_EOL
                    . 'value1a,value1b,value1c' . PHP_EOL
                    . 'value2a,value2b,value2c' . PHP_EOL
        ;
        if ( !File::exists(storage_path('tests')) ) {File::makeDirectory(storage_path('tests'));}
        if (  File::exists($filepath))              {File::delete($filepath);}
        File::put($filepath, $contents);
        
        // open it using App\Utils\Csv, creating data object
        $data = CSV::fromFilepath($filepath);
        // print_r($data);
        
        // verify data object contains the expected properties
        $this->assertEquals($data[0]['columnA'], 'value1a');
        $this->assertEquals($data[0]['columnB'], 'value1b');
        $this->assertEquals($data[0]['columnC'], 'value1c');
        $this->assertEquals($data[1]['columnA'], 'value2a');
        $this->assertEquals($data[1]['columnB'], 'value2b');
        $this->assertEquals($data[1]['columnC'], 'value2c');
        
        // destroy created csv file
        File::delete($filepath);
    }
    
    /**
     * @brief   Unit - Test App\Utils\FilenameGenerator::random
     * @return void
     */
    public function test__App_Utils_FilenameGenerator__random__produces_expected_string_length_with_timestamp()
    {
        $charLimit      = 8;
        $useTimestamps  = true;
        $extension      = 'txt';
        
        $filename = FilenameGenerator::random($charLimit, $useTimestamps, $extension);
        
        $expectedLengths = [
            'charLimit' => $charLimit,
            'timestamp' => 11,
            'extension' => (strlen($extension) + 1)
        ];
        $expectedLengths['total']   = $expectedLengths['charLimit']
                                    + $expectedLengths['timestamp']
                                    + $expectedLengths['extension']
        ;
        
        $this->assertEquals(strlen($filename), $expectedLengths['total']);
    }
    
    /**
     * @brief   Unit - Test App\Utils\FilenameGenerator::random
     * @return void
     */
    public function test__App_Utils_FilenameGenerator__random__produces_expected_string_length_without_timestamp()
    {
        $charLimit      = 8;
        $useTimestamps  = false;
        $extension      = 'txt';
        
        $filename = FilenameGenerator::random($charLimit, $useTimestamps, $extension);
        
        $expectedLengths = [
            'charLimit' => $charLimit,
            'timestamp' => 0,
            'extension' => (strlen($extension) + 1)
        ];
        $expectedLengths['total']   = $expectedLengths['charLimit']
                                    + $expectedLengths['timestamp']
                                    + $expectedLengths['extension']
        ;
        
        $this->assertEquals(strlen($filename), $expectedLengths['total']);
    }
    
    /**
     * @brief   Unit - Test App\Utils\FilenameGenerator::random
     * @return void
     */
    public function test__App_Utils_FilenameGenerator__random__produces_expected_string_length_with_timestamp_and_nonstandard_fileextension()
    {
        $charLimit      = 8;
        $useTimestamps  = true;
        $extension      = 'pajamas';
        
        $filename = FilenameGenerator::random($charLimit, $useTimestamps, $extension);
        
        $expectedLengths = [
            'charLimit' => $charLimit,
            'timestamp' => 11,
            'extension' => (strlen($extension) + 1)
        ];
        $expectedLengths['total']   = $expectedLengths['charLimit']
                                    + $expectedLengths['timestamp']
                                    + $expectedLengths['extension']
        ;
        
        $this->assertEquals(strlen($filename), $expectedLengths['total']);
    }
    
    
    
}
