import React, { useMemo, useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function Index({ products }) {
  const { cart } = usePage().props;

  const [query, setQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("default"); // default | price_asc | price_desc
  const [loadingProductId, setLoadingProductId] = useState(null);

  // ✅ HERO random background images
const heroImages = useMemo(
  () => [
    "https://images.pexels.com/photos/7318912/pexels-photo-7318912.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/6214389/pexels-photo-6214389.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/9594081/pexels-photo-9594081.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  []
);


  const [heroBg, setHeroBg] = useState(heroImages[0]);

  // ✅ pilih random saat halaman pertama kali load
  useEffect(() => {
    const random = heroImages[Math.floor(Math.random() * heroImages.length)];
    setHeroBg(random);
  }, [heroImages]);

  const money = (cents) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      (cents ?? 0) / 100
    );

  const filtered = useMemo(() => {
    let list = products ?? [];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => (p.name ?? "").toLowerCase().includes(q));
    }

    if (inStockOnly) {
      list = list.filter((p) => (p.stock_quantity ?? 0) > 0);
    }

    if (sort === "price_asc") {
      list = [...list].sort((a, b) => (a.price_cents ?? 0) - (b.price_cents ?? 0));
    }

    if (sort === "price_desc") {
      list = [...list].sort((a, b) => (b.price_cents ?? 0) - (a.price_cents ?? 0));
    }

    return list;
  }, [products, query, inStockOnly, sort]);

  const addToCart = (productId) => {
    setLoadingProductId(productId);

    router.post(
      route("cart.items.store"),
      { product_id: productId, quantity: 1 },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Added to cart"),
        onError: () => toast.error("Failed to add to cart"),
        onFinish: () => setLoadingProductId(null),
      }
    );
  };

  return (
    <AuthenticatedLayout header="Products">
      <div className="space-y-6">
        {/* ✅ HERO TOOLBAR WITH RANDOM IMAGE BACKGROUND */}
        <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-transparent shadow-2xl">
  {/* background image */}
  <div className="absolute inset-0">
    <img
      src={heroBg}
      alt="hero background"
      referrerPolicy="no-referrer"
      className="h-full w-full object-cover opacity-90"
      loading="lazy"
    />
  </div>

  {/* overlay supaya text kebaca */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/30" />
  <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

  {/* content */}
  <CardContent className="relative p-5 sm:p-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-9 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus-visible:ring-white/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={inStockOnly ? "default" : "outline"}
          onClick={() => setInStockOnly((v) => !v)}
          className={
            inStockOnly ? "" : "bg-white/10 text-white border-white/20 hover:bg-white/15"
          }
        >
          In stock only
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            setSort((s) => (s === "price_asc" ? "price_desc" : "price_asc"))
          }
          className="bg-white/10 text-white border-white/20 hover:bg-white/15"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by price
        </Button>
      </div>
    </div>

    <div className="mt-3 text-xs text-white/70">
      Showing: <span className="font-semibold text-white">{filtered.length}</span> items
    </div>
  </CardContent>
</Card>

        {/* ✅ Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const outOfStock = (p.stock_quantity ?? 0) <= 0;
            const lowStock =
              (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 0) && !outOfStock;

            return (
              <Card key={p.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-slate-900">
                      {p.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {money(p.price_cents)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {outOfStock ? (
                      <Badge variant="danger">Out of stock</Badge>
                    ) : lowStock ? (
                      <Badge variant="warning">Low stock</Badge>
                    ) : (
                      <Badge variant="success">Available</Badge>
                    )}
                    <div className="text-xs text-slate-500">
                      Stock: {p.stock_quantity}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      className="w-full"
                      onClick={() => addToCart(p.id)}
                      disabled={outOfStock || loadingProductId === p.id}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {loadingProductId === p.id ? "Adding..." : "Add to Cart"}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => router.visit(route("products.show", p.id))}
                      className="hidden sm:inline-flex"
                    >
                      Details
                    </Button>
                  </div>

                  {lowStock && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      Stock is running low — order soon.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ✅ empty state */}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="text-sm font-semibold text-slate-900">
              No products found
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Try a different keyword or clear filters.
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
