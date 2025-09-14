# 🚀 Expense Tracker - Smart Financial Management System

A modern, AI-powered expense tracking application built with React, Redux, and Material-UI. Features intelligent document processing, real-time analytics, and comprehensive financial insights with beautiful dark/light mode support.

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo![Material-UI](https://img.shields.io/badge/Material--UI-5.14.0-007(https://img.shields.io/badge/Redux_Toolkit-1.9.0-764ABC?style=for-the-badge&logo=redux&tps://img.shields.io/badge/Node.js-18.0.0-339933?style=for-the-badge&logo=no
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-https://img.shields.io## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## ✨ Features

### 🤖 AI-Powered Document Processing
- **Smart OCR**: Multi-pass Tesseract OCR with Google Vision API integration
- **Receipt Analysis**: Automatic expense extraction from receipt images (JPG, PNG, GIF)
- **Bank Statement Import**: Intelligent PDF processing with transaction parsing
- **AI Categorization**: Google Gemini 1.5 Flash powered expense categorization
- **Manual Review System**: Smart validation with manual correction capabilities

### 📊 Advanced Analytics & Reporting
- **Real-time Dashboard**: Live financial metrics with animated visualizations
- **Interactive Charts**: Recharts-powered pie charts, line graphs, and bar charts
- **Trend Analysis**: Daily, weekly, monthly financial flow patterns
- **Category Insights**: Detailed expense distribution and spending patterns
- **Export Capabilities**: PDF, CSV, and Excel export functionality

### 💫 Modern User Experience
- **Dual Theme System**: Beautiful dark/light mode with smooth transitions
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Micro-animations**: Framer Motion powered smooth interactions
- **Glassmorphism UI**: Modern translucent design elements
- **Progressive Loading**: Skeleton screens and optimistic updates

### 🔧 Advanced Features
- **Optimistic Updates**: Real-time UI updates with automatic rollback
- **Professional Pagination**: Efficient data handling with theme-aware controls
- **Advanced Filtering**: Multi-parameter search and filtering system
- **Error Boundaries**: Robust error handling and user feedback
- **PWA Support**: Installable progressive web application

## 🎥 Demo

🔗 **Live Demo**: [https://expense-tracker-demo.vercel.app](https://expense-tracker-demo.vercel.app)

## 📱 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/1a1a2 Management
![Transactions](https://via.placeholder.com/800x400/16213e/ffffff?text=Transactiond
![Upload](https://via.placeholder.com/800x400/0f3460/ffffff?text=AI+Documentplaceholder.com/800x400/533483/ffffff?text=Advance 🛠 Tech Stack

### Frontend
- **React 18.2.0** - Modern component-based UI library
- **Redux Toolkit** - Predictable state container
- **Material-UI v5** - React component library with theming
- **Framer Motion** - Production-ready motion library
- **Recharts** - Composable charting library
- **Day.js** - Fast 2kB alternative to Moment.js

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - JSON Web Token for authentication
- **Multer** - Middleware for file uploads

### AI & Cloud Services
- **Google Gemini 1.5 Flash** - Advanced AI text processing
- **Tesseract.js** - Pure JavaScript OCR engine
- **Google Vision API** - Cloud-based OCR service
- **Cloudinary** - Image and video management platform

### Development Tools
- **Vite** - Next generation frontend tooling
- **ESLint** - Code linting utility
- **Prettier** - Code formatter
- **Husky** - Git hooks made easy

## 📁 Project Structure

```
expense-tracker/
├── frontend/                     # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Animations/       # Framer Motion components
│   │   │   │   └── AnimatedComponents.js
│   │   │   ├── Charts/           # Interactive chart components
│   │   │   │   └── InteractiveCharts.js
│   │   │   ├── TransactionForm.js
│   │   │   └── DeleteConfirmDialog.js
│   │   ├── features/             # Redux feature slices
│   │   │   └── transactions/
│   │   │       └── transactionSlice.js
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useOptimisticUpdates.js
│   │   ├── pages/                # Main application pages
│   │   │   ├── Dashboard.js      # Financial overview dashboard
│   │   │   ├── Transactions.js   # Transaction management
│   │   │   ├── Analytics.js      # Advanced analytics
│   │   │   └── Upload.js         # AI-powered file processing
│   │   ├── services/             # API and external services
│   │   │   └── api.js
│   │   ├── utils/                # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.js                # Main App component
│   │   ├── index.js              # Application entry point
│   │   └── store.js              # Redux store configuration
│   ├── package.json
│   └── README.md
├── backend/                      # Node.js backend application
│   ├── controllers/              # Route controllers
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── uploadController.js
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/                   # Mongoose models
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── upload.js
│   ├── services/                 # Business logic services
│   │   ├── ocrService.js
│   │   ├── aiService.js
│   │   └── cloudinaryService.js
│   ├── utils/                    # Utility functions
│   │   └── helpers.js
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   └── package.json
├── docs/                         # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── .gitignore
├── docker-compose.yml
├── LICENSE
└── README.md
```

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn**
- **MongoDB** (version 6.0 or higher)
- **Git** for version control

### Required API Keys
- Google Gemini API key
- Google Vision API credentials (optional)
- Cloudinary account credentials

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Amitkr-2004/Finance.git
cd Finance/Expense\ Tracker
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your environment variables (see Environment Variables section)
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your environment variables
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or start with Docker
docker run --name expense-tracker-mongo -p 27017:27017 -d mongo:6.0
```

### 5. Start the Application
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend application (from frontend directory)
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# AI Services
GEMINI_API_KEY=your-google-gemini-api-key
GOOGLE_APPLICATION_CREDENTIALS=path/to/google-vision-credentials.json
GOOGLE_PROJECT_ID=your-google-cloud-project-id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_PWA=true

# Environment
REACT_APP_ENVIRONMENT=development
```

## 📖 Usage

### Getting Started

1. **Register/Login**: Create an account or log in to access your dashboard
2. **Upload Documents**: Use the Upload page to process receipts or bank statements
3. **Review Transactions**: Check and edit AI-extracted transactions
4. **Analyze Finances**: View insights on the Analytics page
5. **Monitor Dashboard**: Track real-time financial metrics

### Key Workflows

#### Document Upload Process
1. Navigate to the Upload page
2. Choose between Receipt Image or PDF Bank Statement
3. Upload your document (max 10MB)
4. Review AI-extracted transactions
5. Edit any transactions that need manual review
6. Save to your transaction history

#### Transaction Management
1. View all transactions on the Transactions page
2. Use advanced filters to find specific transactions
3. Edit transactions inline or in detailed forms
4. Delete unwanted transactions with confirmation
5. Export data in multiple formats

#### Analytics & Insights
1. Select date ranges for analysis
2. View category breakdowns and trends
3. Monitor income vs expense patterns
4. Export reports for external use

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
```

### Transaction Endpoints
```
GET    /api/transactions              # Get user transactions
POST   /api/transactions              # Create new transaction
GET    /api/transactions/:id          # Get specific transaction
PUT    /api/transactions/:id          # Update transaction
DELETE /api/transactions/:id          # Delete transaction
```

### Upload Endpoints
```
POST /api/upload/receipt           # Process receipt image
POST /api/upload/bank-statement    # Process PDF bank statement
```

### Analytics Endpoints
```
GET /api/analytics/summary         # Get financial summary
GET /api/analytics/trends          # Get trend data
GET /api/analytics/categories      # Get category breakdown
```

For detailed API documentation, see [API.md](docs/API.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Follow ESLint and Prettier configurations
- Use meaningful commit messages
- Add JSDoc comments for functions
- Ensure responsive design
- Test on multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Amit Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **Material-UI Team** - For the excellent component library
- **Recharts** - For beautiful data visualizations
- **Framer Motion** - For smooth animations
- **Google Cloud** - For Vision API and Gemini AI services
- **Cloudinary** - For image and file management
- **MongoDB** - For flexible data storage

## 📧 Support & Contact

- **Author**: Amit Kumar
- **GitHub**: [@Amitkr-2004](https://github.com/Amitkr-2004)
- **Email**: [amitkumar@gmail.com](mailto:amitkumar@gmail.com)

***

<div align="center">

**⭐ Star this repository if you found it helpful!**

**Built with ❤️ using React, Node.js, and modern web technologies.**

[🔝 Back to Top](#-expense-tracker---smart-financial-management-system)

</div>

***