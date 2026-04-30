# Secure and Scalable Multi-Vendor Marketplace Platform

A professional, full-stack marketplace application designed for high-performance peer-to-peer commerce. This platform bridges the gap between sophisticated backend engineering and an intuitive, modern frontend, providing a seamless ecosystem for users to list, discover, and trade goods securely.

---

## 🚀 Key Features

### 🛒 Multi-Vendor Marketplace
- **Listing Management**: Full CRUD (Create, Read, Update, Delete) operations for product listings.
- **Image Handling**: Multi-image upload support with UUID-based storage and real-time previews.
- **Advanced Discovery**: Robust filtering system by category, location, price range, and keyword search.

### 💬 Communication & Security
- **Real-time Chat**: Instant bidirectional messaging powered by WebSockets for seamless negotiations.
- **Stateless Authentication**: Secure JWT-based login and registration with bcrypt password hashing.
- **User Profiles**: Personalized dashboards to manage listings, avatars, and account details.

### 🛡 Moderation & Control
- **Admin Panel**: Elevated privileges for managing all users and moderating platform listings.
- **Responsive Design**: Mobile-first UI built with TailwindCSS and Framer Motion animations.

---

## 🛠 Tech Stack

### Backend
- **FastAPI**: Asynchronous Python web framework for high-concurrency API performance.
- **SQLAlchemy & Alembic**: Advanced ORM and version-controlled database migrations.
- **PostgreSQL**: Production-grade relational database for persistent storage.
- **Pydantic V2**: Strict data validation and settings management.

### Frontend
- **React (TypeScript)**: Component-based architecture for a reactive user interface.
- **Vite**: Next-generation frontend tooling for optimized builds.
- **TanStack Query**: Efficient server-state management and caching.
- **TailwindCSS**: Utility-first CSS framework for modern, responsive styling.

---

## 📦 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js (v18+) & npm**

### 2. Backend Installation
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment Setup
cp .env.example .env
# Edit .env to configure your SECRET_KEY and DATABASE_URL

# Database Setup
alembic upgrade head

# Start Server
uvicorn app.main:app --reload
```
API Docs: `http://localhost:8000/docs`

### 3. Frontend Installation
```bash
cd marketplace-frontend

# Install dependencies
npm install

# Start Development Server
npm run dev
```
Local URL: `http://localhost:5173`

---

## 🧪 Testing Guide

The project maintains high reliability through a multi-layered testing strategy.

### 1. Backend Tests (Pytest)
Located in the `tests/` directory. These tests verify API endpoints, authentication logic, and database interactions.
```bash
# From project root
pytest tests/
```

### 2. Frontend Tests (Vitest)
Located alongside components. These tests verify UI rendering and user interactions.
```bash
cd marketplace-frontend
npm run test
```

### 3. Manual Testing Scenarios
Detailed manual testing protocols for Auth, Listings, Chat, and Admin features can be found in:
`documentation/structured_v2/06_Testing_Scenarios.txt`

---

## 📁 Project Structure
- `/app`: FastAPI source code (models, schemas, endpoints).
- `/alembic`: Database migration scripts.
- `/marketplace-frontend`: React source code (components, pages, context).
- `/documentation/structured_v2`: Comprehensive academic and user documentation.
- `/uploads`: Local storage for product images.

---

## 📄 Extended Documentation
For a deep dive into the architecture and usage, refer to the following files in `documentation/structured_v2/`:
- `01_Introduction.txt`: Motivation and Problem Statement.
- `02_User_Documentation.txt`: Installation Guide and User Manual.
- `03_Developer_Documentation.txt`: System Architecture and Module Implementation.
- `04_Summary.txt`: Project Reflective Summary.
