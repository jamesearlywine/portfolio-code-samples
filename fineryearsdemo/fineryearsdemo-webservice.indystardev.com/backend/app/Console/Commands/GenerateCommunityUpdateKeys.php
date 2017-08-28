<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ORM\Community;

class GenerateCommunityUpdateKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'util:generateCommunityUpdateKeys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Update Keys for all Communities in the database that don\'t already have one.';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        foreach (Community::get() as $community) {
            Community::generateEnhancedUpdateApiKey($community, true);
        }
    }
}
