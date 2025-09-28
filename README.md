# 🌸 Saree Not Sorry

> *An elegant e-commerce platform celebrating the timeless beauty of sarees*

## ✨ About

Saree Not Sorry is a modern, full-stack e-commerce application built with Next.js, designed to showcase and sell beautiful sarees. The platform offers a seamless shopping experience with elegant design, secure authentication, and comprehensive order management.

## 🚀 Features

- **🛍️ Product Catalog** - Browse through curated collections of cotton, silk, designer, and wedding sarees
- **🔐 Secure Authentication** - User registration and login with NextAuth.js
- **🛒 Shopping Cart** - Add, remove, and manage items with real-time updates
- **📦 Order Management** - Complete checkout process with order tracking
- **👤 User Dashboard** - Personal profile and order history management
- **🔧 Admin Panel** - Product and order management for administrators
- **📱 Responsive Design** - Optimized for all devices and screen sizes
- **🎨 Modern UI** - Clean, elegant interface with smooth animations

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### Backend
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication solution
- **JWT** - Secure token-based authentication

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Git** - Version control

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saree-not-sorry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── models/             # Database models
├── store/              # State management
└── types/              # TypeScript type definitions
```

## 🎯 Usage

1. **Browse Products** - Explore different saree categories
2. **User Registration** - Create an account to start shopping
3. **Add to Cart** - Select your favorite sarees
4. **Secure Checkout** - Complete your purchase safely
5. **Track Orders** - Monitor your order status

## 🔒 Privacy & Security

This application prioritizes user privacy and data security:
- Secure authentication with encrypted passwords
- Protected API routes
- Safe data handling practices
- No unnecessary data collection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## 📄 License

This project is licensed under the MIT License.

## 💝 Acknowledgments

Built with passion for traditional Indian fashion and modern web technologies.

---

*Made with ❤️ for saree enthusiasts everywhere*
