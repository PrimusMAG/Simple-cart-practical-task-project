@component('mail::message')
# Daily Sales Report

**Date:** {{ $date }}

@if (count($rows) === 0)
No products were sold today.
@else

@component('mail::table')
| Product | Quantity Sold | Revenue |
|:--------|-------------:|--------:|
@foreach ($rows as $row)
| {{ $row['product_name'] }} | {{ $row['quantity_sold'] }} | ${{ number_format($row['revenue_cents']/100, 2) }} |
@endforeach
@endcomponent

@endif

Thanks,  
{{ config('app.name') }}
@endcomponent
