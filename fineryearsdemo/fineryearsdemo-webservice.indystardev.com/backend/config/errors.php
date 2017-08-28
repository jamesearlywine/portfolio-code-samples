<?php

return [
  // (intentionally) ambiguous access error
  '201' => ['number' => 201, 'description' => 'Not authorized.'],
  '202' => ['number' => 202, 'description' => 'Input validation error.'],
  
  // guest user registration and login errors
  '301' => ['number' => 301, 'description' => 'That email address is already registered.'],
  '302' => ['number' => 302, 'description' => 'Could not create user.'],
  '303' => ['number' => 303, 'description' => 'That email is not registered.'],
  
  // communities
  '401' => ['number' => 401, 'description' => 'That community id {{communityId}} does not exist.'],
  
  // emails
  '501' => ['number' => 501, 'description' => 'That community has no email address.'],
  
];