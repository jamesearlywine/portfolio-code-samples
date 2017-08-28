<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ORM\Community;
use App\Models\ORM\CommunityGalleryImage;

class PushImagesCacheToS3 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 's3Cache:pushImages';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Push Images to the S3 imageCache';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        foreach (Community::get() as $item) {
            $item->pushImageToS3();
        }
        foreach (CommunityGalleryImage::get() as $item) {
            $item->pushImageToS3();
        }
        
        $this->comment('S3 imageCache Initialized');
    }
}
