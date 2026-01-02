# SRS (Software Requirements Specification)

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the **Simple E-commerce Shopping Cart System**. The system allows authenticated users to browse products, manage a persistent cart stored in the database, and checkout with stock validation. It also includes automated notifications and daily reporting via Laravel Jobs and Scheduler.

### 1.2 Scope
The system provides:
- Product browsing and listing  
- Persistent cart per authenticated user  
- Cart actions: add, update, remove  
- Checkout flow with stock reduction and order creation  
- Low-stock notification via queued job  
- Daily sales report via scheduled job  

### 1.3 Target Users
- Authenticated customers  
- Dummy admin recipient (notifications & reports)  

---

## 2. Technology Stack
- **Backend:** Laravel  
- **Frontend:** React (Inertia)  
- **Styling:** Tailwind CSS  
- **Database:** MySQL / PostgreSQL / SQLite  
- **Queues:** Laravel Queue Jobs  
- **Scheduler:** Laravel Scheduler + Cron  
- **Email:** SMTP / Mailtrap  

---

## 3. Functional Requirements

### FR-1 Authentication
- The system SHALL use Laravel Starter Kit authentication.  
- Only authenticated users SHALL access cart and checkout features.  

### FR-2 Product Browsing
- Products SHALL display `name`, `price`, and `stock_quantity`.  
- Users SHALL be able to browse products.  

### FR-3 Cart Persistence
- The cart SHALL be stored in the database and associated with the authenticated user.  
- The system SHALL NOT use session/local storage for cart persistence.  

### FR-4 Cart Operations
- Users SHALL be able to add products to cart.  
- Users SHALL be able to update quantities.  
- Users SHALL be able to remove items.  
- The system SHALL validate stock availability for each operation.  

### FR-5 Checkout
- The system SHALL create an Order and OrderItems upon checkout.  
- The system SHALL reduce product stock after checkout.  
- The system SHALL clear the cart after successful checkout.  

### FR-6 Low Stock Notification
- When stock is below threshold, the system SHALL dispatch a queued job.  
- The job SHALL send a low-stock email to the dummy admin.  

### FR-7 Daily Sales Report
- Every evening, the system SHALL run a scheduled job.  
- The job SHALL send a report of products sold that day to the dummy admin.  

---

## 4. Non-Functional Requirements

### NFR-1 Performance
- Cart operations SHOULD respond quickly.  
- Background tasks SHOULD run asynchronously.  

### NFR-2 Reliability
- Queue jobs SHALL be retryable.  
- Scheduler SHALL run daily and log execution.  

### NFR-3 Maintainability
- Code SHALL follow Laravel best practices:
  - Form Requests for validation  
  - Services for business logic  
  - Policies for authorization  
  - Jobs for background processing  

---

## 5. Security Requirements

### SR-1 Authentication Security
- Passwords SHALL be securely hashed by Laravel.  
- Protected routes SHALL use auth middleware.  

### SR-2 Authorization
- Users SHALL only access their own cart and orders.  
- Policies SHALL enforce access restrictions.  

### SR-3 Input Validation
- Requests SHALL validate quantity and stock.  
- Invalid payloads SHALL be rejected.  

### SR-4 Web Security
- CSRF protection SHALL be enabled by Laravel.  
- XSS prevention SHALL rely on escaping in templates and React rendering.  

### SR-5 Configuration Security
- Secrets SHALL be stored in `.env`.  
- `.env` SHALL NOT be committed to GitHub.  

---

## Starter Kit Reference (Credits)
This project is based on the **Laravel + React Starter Kit (Inertia)**.  
Starter kit documentation: https://laravel.com/docs/starter-kits
