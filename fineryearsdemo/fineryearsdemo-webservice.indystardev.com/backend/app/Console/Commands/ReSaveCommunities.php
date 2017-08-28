<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ORM\Community;

class ReSaveCommunities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'util:reSaveCommunities';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 're-saves each community (runs all related tasks. like generating latitudes and longitudes, etc)';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        // latitude and longitude are generated when entity is saved.
        foreach (Community::get() as $community) {
            $community->save();
        }
    }
}
