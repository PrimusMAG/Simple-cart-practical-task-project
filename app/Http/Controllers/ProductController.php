<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->orderBy('name')
            ->get(['id', 'name', 'price_cents', 'stock_quantity', 'image_url']);

        return Inertia::render('Products/Index', [
            'products' => $products,
        ]);
    }
}
