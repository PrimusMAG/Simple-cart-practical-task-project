<?php

namespace App\Providers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Policies\CartPolicy;
use App\Policies\CartItemPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Cart::class => CartPolicy::class,
        CartItem::class => CartItemPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
