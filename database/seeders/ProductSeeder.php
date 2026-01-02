<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'T-Shirt',
                'category' => 'Apparel',
                'price_cents' => 149000,
                'stock_quantity' => 25,
                'low_stock_threshold' => 5,
                'image_url' => 'https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg',
            ],
            [
                'name' => 'Sneakers',
                'category' => 'Footwear',
                'price_cents' => 299000,
                'stock_quantity' => 6,
                'low_stock_threshold' => 2,
                'image_url' => 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
            ],
            [
                'name' => 'Hoodie',
                'category' => 'Apparel',
                'price_cents' => 249000,
                'stock_quantity' => 12,
                'low_stock_threshold' => 4,
                'image_url' => 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
            ],
            [
                'name' => 'Backpack',
                'category' => 'Accessories',
                'price_cents' => 199000,
                'stock_quantity' => 15,
                'low_stock_threshold' => 5,
                'image_url' => 'https://images.pexels.com/photos/3731256/pexels-photo-3731256.jpeg',
            ],
            [
                'name' => 'Cap',
                'category' => 'Accessories',
                'price_cents' => 99000,
                'stock_quantity' => 8,
                'low_stock_threshold' => 3,
                'image_url' => 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg',
            ],
        ];

        foreach ($products as $data) {
            Product::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
