Desi Dhaba - Food Delivery Platform

A full-stack food delivery web application built with the MERN stack.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- Media: Cloudinary (image upload)
- Security: Helmet, CORS, Rate Limiting

## Project Structure

```text
Desi Dhaba/
  Backend/
  Frontend/
```

## Features

- User authentication (register/login) with JWT
- Role-based access control (user/admin)
- Restaurant listing and management
- Food item listing and management
- Cart management
- Checkout and order placement
- Order tracking and order history
- Coupon validation and discount handling
- Reviews and ratings
- Admin dashboard and order management
- Seed script for initial data setup

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (local or hosted)
- Cloudinary account (for image uploads)

## Environment Variables

Create a `.env` file inside `Backend/`.

Important: Do not commit your real `.env` values.

Use this template (replace placeholders):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
ALLOW_ADMIN_REGISTER=false
```

## Installation

### 1. Install backend dependencies

```bash
cd Backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

## Run the App

Open two terminals.

### Terminal 1: Backend

```bash
cd Backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### Terminal 2: Frontend

```bash
cd Frontend
npm run dev
```

Frontend runs on: `http://localhost:5173` (or next available port)

## Seed Data (Optional)

To populate initial data:

```bash
cd Backend
npm run seed
```

This creates demo data and a default admin account as defined in `Backend/seed.js`.

## API Base URL

- Frontend uses: `/api`
- Backend routes are mounted under: `/api/*`

Main route groups:

- `/api/auth`
- `/api/restaurants`
- `/api/foods`
- `/api/cart`
- `/api/orders`
- `/api/reviews`
- `/api/coupons`
- `/api/analytics`

## Build Frontend

```bash
cd Frontend
npm run build
npm run preview
```

## Notes

- Keep `node_modules` and `.env` out of version control.
- If ports are already in use, Vite will auto-select another port.
- Ensure `CLIENT_URL` in backend `.env` matches the frontend dev URL.
](https://github.com/Aditya51002/Food-Delivery.git)
