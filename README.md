# 📦 SmartShelfX – AI-Based Inventory Forecast & Auto-Restock System
 
## 📌 Overview

**SmartShelfX** is an AI-powered Inventory Management System designed to automate inventory tracking, demand forecasting, and stock replenishment. The application enables businesses to efficiently manage products, vendors, purchase orders, inventory movements, and reports through a secure role-based web platform.

The system integrates machine learning-based demand forecasting to reduce stock shortages and overstock situations while improving inventory planning.

---

# 🚀 Features

## 🔐 Authentication & Authorization

- User Registration
- Secure Login using JWT Authentication
- Role-Based Access Control
- Spring Security Integration

---

## 📊 Dashboard

- Inventory Overview
- Stock Statistics
- Product Analytics
- Real-Time Dashboard Cards
- Inventory Performance Charts

---

## 📦 Product Management

- Add New Products
- Edit Product Details
- Delete Products
- Product Search
- Product Categories
- Inventory Status Tracking

---

## 📈 AI Demand Forecasting

- AI-based Inventory Forecast
- Demand Prediction
- Restock Suggestions
- Forecast Reports
- Machine Learning API Integration

---

## 🚚 Purchase Order Management

- Create Purchase Orders
- Manage Orders
- Vendor Assignment
- Order Status Tracking

---

## 🏭 Vendor Management

- Add Vendors
- Update Vendor Information
- Delete Vendors
- Vendor Directory

---

## 📦 Stock Transactions

- Stock In
- Stock Out
- Inventory Adjustment
- Transaction History

---

## 🔔 Notifications

- Low Stock Alerts
- Restock Notifications
- Inventory Updates

---

## 📑 Reports

- Sales Reports
- Inventory Reports
- Stock Movement Reports
- Expiry Reports
- Chart-based Analytics

---

# 🏗️ Tech Stack

## Frontend

- Angular 21
- TypeScript
- Angular Material
- HTML5
- CSS3
- Chart.js
- RxJS

---

## Backend

- Spring Boot 4
- Spring Security
- Spring Data JPA
- Maven
- REST APIs
- JWT Authentication

---

## Database

- MySQL

---

## AI & Forecasting

- External Machine Learning Service
- Demand Forecast API

---

# 📂 Project Structure

```
SmartShelfX
│
├── frontend/
│   ├── Angular 21
│   ├── Dashboard
│   ├── Products
│   ├── Reports
│   ├── Notifications
│   ├── Forecast
│   ├── Users
│   ├── Vendors
│   └── Stock Transactions
│
├── backend/
│   ├── Controllers
│   ├── Services
│   ├── Repositories
│   ├── Entities
│   ├── DTOs
│   ├── Security
│   └── Configurations
│
└── Database
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/SmartShelfX.git

cd SmartShelfX
```

---

## Backend Setup

Navigate to backend folder

```bash
cd backend
```

Configure MySQL in

```
application.properties
```

Example

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartshelfx
spring.datasource.username=root
spring.datasource.password=root
```

Run Spring Boot

```bash
mvn spring-boot:run
```

Backend runs on

```
http://localhost:8080
```

---

## Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install packages

```bash
npm install
```

Run Angular

```bash
ng serve
```

Frontend runs on

```
http://localhost:4200
```

---

# 🔗 API Modules

- Authentication API
- Product API
- Forecast API
- Notification API
- Purchase Order API
- Vendor API
- Reports API
- User API
- Stock Transaction API

---

# 🔒 Security

- JWT Authentication
- Spring Security
- Password Encryption
- Protected REST APIs
- Role-Based Authorization

---

# 📊 Future Enhancements

- AI Auto Purchase Order Generation
- Barcode Scanner Integration
- QR Code Inventory Tracking
- Email Notifications
- SMS Alerts
- Cloud Deployment
- Docker Support
- Predictive Analytics Dashboard
- Multi-Warehouse Management

---

# 📸 Screenshots

Add screenshots here:

- Login Page
- Dashboard
- Product Management
- Forecast Dashboard
- Reports
- Vendor Management
- Purchase Orders

---

# 📚 Learning Outcomes

This project demonstrates practical implementation of:

- Full Stack Development
- REST API Development
- JWT Authentication
- Spring Boot
- Angular
- MySQL
- AI Integration
- Inventory Management
- Data Visualization
- Secure Web Application Development

---

# 👨‍💻 Author

**Rahul Bochu**

- GitHub: https://github.com/rahulbochu
- LinkedIn: https://www.linkedin.com/in/rahulb2005/

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future improvements.

---

## License

This project is intended for educational and learning purposes.
