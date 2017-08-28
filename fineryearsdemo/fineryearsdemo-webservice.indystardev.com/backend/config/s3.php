<?php

return [
    'bucketUrl'                 => env('S3BUCKETURL', null),
    's3Bucket'                  => env('S3BUCKET', null),
    'imageCache'                => 'imageCache',
    'deleteImagesAfterCached'   => true,
    'webserviceCache'           => 'webserviceCache'
];