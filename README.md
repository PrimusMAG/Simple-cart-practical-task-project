# Simple E-commerce Shopping Cart (Laravel + React)

A simple e-commerce shopping cart system built with **Laravel** and **React (Inertia)**.  
Users can browse products, add items to cart, update quantities, remove items, and checkout.  
Cart data is persisted in the database and associated with the authenticated user (**not** session/local storage).

This project was developed as a practical technical task and follows Laravel best practices:
- Laravel Starter Kit authentication
- Policies for authorization and data isolation
- Form Request validation
- Service layer for business logic
- Queue jobs for background processing (emails)
- Scheduled jobs (cron) for daily reports

---

## Features

### User Features
- ✅ Authentication (Laravel Starter Kit)
- ✅ Browse products (name, price, stock_quantity)
- ✅ Add items to cart
- ✅ Update cart item quantities
- ✅ Remove cart items
- ✅ Checkout and generate orders
- ✅ Cart persistence per authenticated user (DB-based)

### System Automation
- ✅ Low Stock Notification (Laravel Job/Queue + Email)
- ✅ Daily Sales Report (Laravel Scheduled Job + Email)

---

## Tech Stack
- **Backend:** Laravel
- **Frontend:** React (Inertia)
- **Styling:** Tailwind CSS
- **Database:** MySQL / PostgreSQL / SQLite (configurable via `.env`)
- **Queue:** Laravel Queue (Database/Redis supported)
- **Scheduler:** Laravel Scheduler + Cron
- **Version Control:** Git / GitHub

---

## Requirements
- PHP >= 8.2
- Composer
- Node.js & NPM
- Database (MySQL/PostgreSQL/SQLite)
- Mail Service (Mailtrap / SMTP)

---

## Installation & Setup (Backend + Frontend + Queue + Scheduler)

```bash
git clone <your-repo-url>
cd <your-project-folder>

composer install
npm install

cp .env.example .env
php artisan key:generate

php artisan migrate
php artisan db:seed

npm run dev
php artisan serve

php artisan queue:work
php artisan schedule:run
