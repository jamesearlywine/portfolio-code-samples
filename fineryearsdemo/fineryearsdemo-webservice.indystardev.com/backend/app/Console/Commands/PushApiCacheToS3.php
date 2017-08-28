<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SportsTicker;

class PushApiCacheToS3 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 's3Cache:pushApi';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Push API Responses (json-fragments) to the S3 apiCache.';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        //SportsTicker::generateApiCache();
        $this->comment('S3 apiCache Initialized');
    }
}
