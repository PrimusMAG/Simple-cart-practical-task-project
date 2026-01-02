@component('mail::message')
# Low Stock Alert

The following product is running low on stock:

**Product:** {{ $product->name }}  
**Remaining Stock:** {{ $product->stock_quantity }}  
**Threshold:** {{ $product->low_stock_threshold }}

Thanks,  
{{ config('app.name') }}
@endcomponent
