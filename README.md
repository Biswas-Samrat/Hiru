# Hiran's Sri Lankan Fusion - Full Stack Application

This project consists of a Node.js/Express backend, a React client website, and a React admin dashboard.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- MongoDB Atlas account (URI is already configured in `backend/.env`)

### 2. Backend Setup
```bash
cd backend
npm install
node seed.js # To populate the menu
npm run dev # Starts server on port 5000
```

### 3. Client Frontend Setup (Customer Site)
```bash
cd client
npm install
npm run dev # Starts on port 5173
```

### 4. Admin Dashboard Setup
```bash
cd admin
npm install
npm run dev # Starts on port 5174 (or next available)
```

## 🛠 Features
- **Royalty Theme**: Black and Gold design with premium typography and glassmorphism.
- **Theatrical Experience**: Video backgrounds and smooth animations (Framer Motion).
- **Interactive Menu**: Category filtering and customization pop-ups for Spice Levels and Curry Bases.
- **Live Order Tracker**: Real-time progress updates using Socket.io and a dynamic countdown timer.
- **Admin Control**: Real-time order management, menu price updates, and out-of-stock toggles.
- **Table Reservations**: Booking management with occupancy tracking.

## 📁 Project Structure
- `/backend`: Express API, MongoDB models, Socket.io logic.
- `/client`: Customer-facing React app.
- `/admin`: Restaurant management React app.

## ⚠️ Note on Database
If you encounter a connection error (`ENOTFOUND`), please ensure your IP is whitelisted in MongoDB Atlas and the connection string in `backend/.env` is correct for your environment.
