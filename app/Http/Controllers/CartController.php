<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Helper: find user's cart or create it.
     */
    private function getOrCreateCart(Request $request): Cart
    {
        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        return $cart;
    }

    /**
     * ✅ Show cart page (VERY IMPORTANT: include product price fields!)
     */
    public function show(Request $request)
    {
        $cart = $this->getOrCreateCart($request);

        // ✅ Ensure product relation is loaded WITH price fields
        $cart->load([
            'items.product' => function ($q) {
                // Add any other columns you need in frontend
                $q->select(
                    'id',
                    'name',
                    'title',
                    'price_cents',
                    'price',
                    'harga',
                    'image_url',
                    'stock_quantity',
                    'category'
                );
            }
        ]);

        return inertia('Cart/Show', [
            'cart' => $cart,
        ]);
    }

    /**
     * ✅ Add item to cart
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->getOrCreateCart($request);

        $product = Product::findOrFail($request->product_id);

        // (Optional) Validate stock, you can remove this if you don't want
        if (isset($product->stock_quantity) && $product->stock_quantity < $request->quantity) {
            return back()->withErrors([
                'stock' => 'Stock not enough.',
            ]);
        }

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

if ($item) {
    $newQty = $item->quantity + $request->quantity;

    if ($newQty > $product->stock_quantity) {
        return back()->withErrors([
            'stock' => 'Stock not enough.',
        ]);
    }

    $item->quantity = $newQty;
    $item->save();

    } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('success', 'Added to cart.');
    }

    /**
     * ✅ Update cart item quantity
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        // Security: ensure item belongs to current user
        if ($cartItem->cart->user_id !== $request->user()->id) {
            abort(403);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        return back()->with('success', 'Cart updated.');
    }

    /**
     * ✅ Remove cart item
     */
    public function destroy(Request $request, CartItem $cartItem)
    {
        // Security: ensure item belongs to current user
        if ($cartItem->cart->user_id !== $request->user()->id) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('success', 'Item removed.');
    }

    /**
     * ✅ Checkout
     *
     * IMPORTANT: Some people empty the cart here.
     * If you empty the cart before the frontend reads the total,
     * your modal might show 0 (because cart becomes empty).
     *
     * To avoid that, we compute total BEFORE deleting items,
     * then store it as flash session so frontend can show correct total.
     */
    public function checkout(Request $request)
    {
        $cart = $this->getOrCreateCart($request);

        $cart->load([
            'items.product' => function ($q) {
                $q->select(
                    'id',
                    'name',
                    'title',
                    'price_cents',
                    'price',
                    'harga',
                    'image_url',
                    'stock_quantity',
                    'category'
                );
            }
        ]);

        if ($cart->items->count() === 0) {
            return back()->withErrors([
                'cart' => 'Cart is empty.',
            ]);
        }

        // ✅ Compute total before doing anything else
        $totalCents = 0;

        foreach ($cart->items as $item) {
            $p = $item->product;

            // Determine product price in cents
            $priceCents = 0;

            if (!is_null($p->price_cents)) {
                $priceCents = (int) $p->price_cents;
            } elseif (!is_null($p->price)) {
                // if price is like 12.50 -> convert to cents
                // if price is already a big integer (like rupiah), keep it as-is
                $priceCents = $p->price > 100000 ? (int) round($p->price) : (int) round($p->price * 100);
            } elseif (!is_null($p->harga)) {
                $priceCents = (int) round($p->harga);
            }

            $totalCents += ((int) $item->quantity) * $priceCents;
        }

        // ✅ OPTIONAL: Here you would create Order, reduce stock, etc.

        // ✅ Clear cart items AFTER computing total
        CartItem::where('cart_id', $cart->id)->delete();

        // ✅ Send total to frontend via flash
        return back()->with([
            'success' => 'Checkout success.',
            'checkout_total_cents' => $totalCents,
        ]);
    }
}
