<?php

namespace App\Services;

use App\Jobs\SendLowStockNotificationJob;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function getOrCreateActiveCart(User $user): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'active'],
            ['status' => 'active']
        );
    }

    public function addProduct(User $user, Product $product, int $quantity): Cart
    {
        if ($quantity < 1) {
            throw ValidationException::withMessages(['quantity' => 'Quantity must be at least 1.']);
        }

        $cart = $this->getOrCreateActiveCart($user);

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        $newQty = ($item?->quantity ?? 0) + $quantity;

        if ($newQty > $product->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Requested quantity exceeds available stock ({$product->stock_quantity}).",
            ]);
        }

        CartItem::updateOrCreate(
            ['cart_id' => $cart->id, 'product_id' => $product->id],
            ['quantity' => $newQty]
        );

        return $cart->fresh(['items.product']);
    }

    public function updateItemQuantity(User $user, CartItem $cartItem, int $quantity): Cart
    {
        if ($quantity < 1) {
            throw ValidationException::withMessages(['quantity' => 'Quantity must be at least 1.']);
        }

        $cartItem->loadMissing('product', 'cart');

        if ($cartItem->cart->user_id !== $user->id) {
            abort(403);
        }

        if ($quantity > $cartItem->product->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Requested quantity exceeds available stock ({$cartItem->product->stock_quantity}).",
            ]);
        }

        $cartItem->update(['quantity' => $quantity]);

        return $cartItem->cart->fresh(['items.product']);
    }

    public function removeItem(User $user, CartItem $cartItem): Cart
    {
        $cartItem->loadMissing('cart');

        if ($cartItem->cart->user_id !== $user->id) {
            abort(403);
        }

        $cart = $cartItem->cart;
        $cartItem->delete();

        return $cart->fresh(['items.product']);
    }

    public function checkout(User $user): Order
    {
        $cart = $this->getOrCreateActiveCart($user);
        $cart->loadMissing('items.product');

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Cart is empty.']);
        }

        return DB::transaction(function () use ($user, $cart) {
            $productIds = $cart->items->pluck('product_id')->unique()->values()->all();

            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cart->items as $item) {
                $product = $products[$item->product_id];
                if ($item->quantity > $product->stock_quantity) {
                    throw ValidationException::withMessages([
                        'stock' => "Not enough stock for {$product->name}. Available: {$product->stock_quantity}.",
                    ]);
                }
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total_cents' => 0,
            ]);

            $total = 0;

            foreach ($cart->items as $item) {
                $product = $products[$item->product_id];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item->quantity,
                    'unit_price_cents' => $product->price_cents,
                ]);

                $lineTotal = $item->quantity * $product->price_cents;
                $total += $lineTotal;

                $product->decrement('stock_quantity', $item->quantity);

                if ($product->stock_quantity <= $product->low_stock_threshold) {
                    SendLowStockNotificationJob::dispatch($product->id);
                }
            }

            $order->update(['total_cents' => $total]);

            $cart->update(['status' => 'checked_out']);
            $cart->items()->delete();

            return $order->fresh(['items.product']);
        });
    }
}
