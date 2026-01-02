<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'T-Shirt', 'price_cents' => 1999, 'stock_quantity' => 25],
            ['name' => 'Hoodie', 'price_cents' => 4999, 'stock_quantity' => 10],
            ['name' => 'Sneakers', 'price_cents' => 8999, 'stock_quantity' => 7],
            ['name' => 'Cap', 'price_cents' => 1499, 'stock_quantity' => 3],
            ['name' => 'Socks', 'price_cents' => 799, 'stock_quantity' => 50],
        ];

        foreach ($products as $p) {
            Product::create([
                ...$p,
                'low_stock_threshold' => 5,
            ]);
        }
    }
}
