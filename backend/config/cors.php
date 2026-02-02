<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your application. This
    | determines what cross-origin requests will be allowed.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:4173',  // Preview port
        'http://localhost:5173',  // Dev port
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:4173',  // Preview port
        'http://127.0.0.1:5173',  // Dev port
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [
        '#localhost#',
        '#127\.0\.0\.1#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
