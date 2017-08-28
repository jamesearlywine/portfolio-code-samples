<?php

return [
    // whitelists should be lowercased, 
    // input will be lowercased before comparison
    'whitelists' => [
        // valid actions (re: recording user coupon interactions)
        'pages' => [
            'ad',
            'billboard',
            'ad-dev',
            'billboard-dev'
        ],
        'actionTypes' => [
            'click'
        ],
        'actionDetails' => [
            'indystar-link',
            'sponsor-link'
        ]
    ]
    
];
