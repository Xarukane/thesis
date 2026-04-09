# Marketplace Fullstack Prototype

A professional marketplace application built with **FastAPI** (Python) and **React** (TypeScript).

## Features
- **Authentication**: JWT-based login/register with secure password hashing.
- **Listings**: Create, Read, Update, and Delete listings with image uploads.
- **Search & Filtering**: Filter by category, location, price range, and keywords.
- **Real-time Chat**: Instant messaging between buyers and sellers via WebSockets.
- **User Profiles**: Manage your own listings and view public profiles of other sellers.
- **Modern UI/UX**: Responsive design with Framer Motion animations and Toast notifications.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js (v18+) & npm

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# (Optional) Edit .env to change your SECRET_KEY

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```
The backend will be running at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd marketplace-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be running at `http://localhost:5173`.

---

## 🛠 Tech Stack
- **Backend**: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic V2, PyJWT, bcrypt.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, TanStack Query (React Query), Framer Motion, Lucide Icons.
- **Database**: SQLite (Development).

## 📁 Project Structure
- `/app`: FastAPI backend source code.
- `/alembic`: Database migration scripts.
- `/marketplace-frontend`: React frontend source code.
- `/uploads`: Local storage for uploaded images.
