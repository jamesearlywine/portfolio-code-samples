<?php

namespace Illuminate\Html;

use Illuminate\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class MenuServiceProvider extends ServiceProvider {

	/**
	 * Indicates if loading of the provider is deferred.
	 *
	 * @var bool
	 */
	protected $defer = true;

	/**
	 * Register the service provider.
	 *
	 * @return void
	 */
	public function register()
	{
		$this->app->singleton('menu', function (Application $app)
        {
            $menu = new MenuBuilder;

            $menu->setUrlGenerator($app->make('url'));
            $menu->setTranslator($app->make('translator'));
			$menu->setRequest($app->rebinding('request', function ($request) use ($menu) {
				$menu->setRequest($request);
			}));

            return $menu;
        });
	}

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return array('menu');
	}

}
