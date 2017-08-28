<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\User;

/**
 * @brief   Integration tests to ensure the backend AdminCMS and API is working
 */
class IntegrationTests extends TestCase
{
    
    /**
     * @brief   Functional - Login screen contains "Admin CMS"
     * @return void
     */
    public function test__login__view_should_contain__admin_cms()
    {
        $this
            ->visit( url('/login') )
            ->see('Admin CMS')
        ;
    }
    
    /**
     * @brief   Functional - Empty Login should produce errors"
     * @return void
     */
    public function test__login_attempt__empty_fields_should_produce_errors()
    {
        $this
            ->visit( url('/login') )
            ->press("login")
            ->see('is required')
        ;
    }
    
    
    /**
     * @brief   Functional - Logged in user can access Admin CMS"
     * @return void
     */
    public function test__user_logged_in__can_access_admincms()
    {
        $user = User::where(['email' => 'admin@indystar.com'])->first();
        $this->be($user);
        $this
            ->visit( url('/admincms') )
            ->seePageIs( url('/admincms') )
        ;
    }
    
    /**
     * @brief   Functional - Attemping to access cruddy without logging, redirects to login"
     * @return void
     */
    public function test__user_not_logged_in__cannot_access_admincms__redirects_to_login()
    {
        $this
            ->visit( url('/admincms') )
            ->seePageIs( url('/login') )
        ;
    }
    
    
}
