<?php

namespace App\Jobs;

use App\Mail\DailySalesReportMail;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendDailySalesReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public ?string $date = null) {}

    public function handle(): void
    {
        $adminEmail = config('shop.admin_email');

        $day = $this->date
            ? Carbon::parse($this->date)->startOfDay()
            : now()->startOfDay();

        $end = $day->copy()->endOfDay();

        $rows = OrderItem::query()
            ->whereBetween('created_at', [$day, $end])
            ->with('product')
            ->get()
            ->groupBy('product_id')
            ->map(function ($items) {
                $product = $items->first()->product;
                $qty = $items->sum('quantity');
                $revenue = $items->sum(fn($i) => $i->quantity * $i->unit_price_cents);

                return [
                    'product_name' => $product?->name ?? 'Unknown',
                    'quantity_sold' => $qty,
                    'revenue_cents' => $revenue,
                ];
            })
            ->values()
            ->all();

        Mail::to($adminEmail)->send(new DailySalesReportMail($day->toDateString(), $rows));
    }
}
