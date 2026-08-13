<div align="center">
  <br />
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" alt="StayNest" width="300" />
  <br />

  <div>
    <img src="https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/-Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </div>

  <h3 align="center">StayNest - Modern Airbnb Clone</h3>

  <p align="center">
    A fully-featured, modern vacation rental platform built with the MERN stack.
    <br />
    <br />
    <a href="#features">Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#getting-started">Getting Started</a>
    ·
    <a href="#environment-variables">Environment Variables</a>
  </p>
</div>

---

## 🌟 Introduction

**StayNest** is a comprehensive, full-stack web application inspired by Airbnb. It allows users to discover, book, and host unique accommodations around the world. Designed with a focus on user experience, performance, and modern web aesthetics, StayNest provides a seamless journey from searching for the perfect stay to secure booking and payment.

## ✨ Features

- **Authentication & Authorization**: Secure user registration and login using JWT (JSON Web Tokens).
- **Property Browsing**: Intuitive and responsive UI to explore listings with advanced filtering and search capabilities.
- **Interactive Maps**: Integrated maps using `Leaflet` to view property locations visually.
- **Booking System**: Seamless booking flow with date selection and conflict prevention.
- **Payment Integration**: Secure payment processing integrated with **Razorpay**.
- **Hosting Portal**: Dedicated host dashboard to create and manage listings, view analytics (using `Recharts`), and manage bookings.
- **Real-time Chat & Notifications**: Live messaging between guests and hosts powered by **Socket.io**.
- **Image Uploads**: Cloud-based image management using **Cloudinary**.
- **PDF Generation**: Automated invoice and booking receipt generation using `pdfkit`.
- **Email Notifications**: Automated email updates for bookings and registrations using `Nodemailer`.
- **Responsive Design**: Mobile-first design approach using **Tailwind CSS** and smooth animations via **Framer Motion**.

## 💻 Tech Stack

### Frontend
- **React.js** (v19) - UI Library
- **Vite** - Build Tool & Development Server
- **Tailwind CSS** (v4) - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Leaflet** - Interactive Maps
- **Recharts** - Data Visualization
- **Axios** - HTTP Client
- **Socket.io-client** - Real-time communication

### Backend
- **Node.js** - Runtime Environment
- **Express.js** (v5) - Web Framework
- **MongoDB & Mongoose** - Database & ODM
- **Socket.io** - WebSocket server for real-time features
- **JWT** - Authentication
- **Bcrypt.js** - Password Hashing
- **Cloudinary & Multer** - Image Upload & Storage
- **Razorpay** - Payment Gateway
- **Nodemailer** - Email Services
- **PDFKit** - Document Generation

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Accounts for [Cloudinary](https://cloudinary.com/) and [Razorpay](https://razorpay.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohanpatel005/StayNest.git
   cd StayNest
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   *Note: If `nodemon` is not installed or configured, you can run `node index.js`*

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

The application will now be running. The frontend typically runs on `http://localhost:5173` (Vite) and the backend on the port specified in your environment variables.

## 🔐 Environment Variables

You need to create a `.env` file in the **backend** directory to run the server correctly. Reference `.env.example` if available, or use the template below:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Nodemailer)
EMAIL_SERVICE=your_email_service (e.g., gmail)
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_app_password
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/rohanpatel005/StayNest/issues).

## 📝 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
