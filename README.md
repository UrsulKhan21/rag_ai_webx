# RAG AI Agent - Full Stack Application

A full-stack web application that transforms APIs into intelligent knowledge bases using RAG (Retrieval-Augmented Generation). Users can connect any API, automatically index the data, and ask questions in natural language.

## Features

- **Google OAuth Authentication**: Secure login with Google accounts
- **API Integration**: Connect any REST API endpoint with optional authentication
- **Automatic Indexing**: Data is automatically embedded and stored in Qdrant vector database
- **AI-Powered Chat**: Ask questions and get accurate answers from your data using LLaMA 3.3
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Real-time Updates**: Instant feedback with toast notifications

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Sonner (toast notifications)
- next-themes (dark mode)

### Backend
- Django 5
- Django REST Framework
- django-cors-headers
- SentenceTransformers (all-MiniLM-L6-v2)
- Qdrant Cloud (vector database)
- Groq API (LLaMA 3.3 70B)
- Supabase PostgreSQL

## Prerequisites

- Python 3.12+
- Node.js 18+
- Google OAuth credentials
- Qdrant Cloud account
- Groq API key
- Supabase account

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Update .env with your credentials

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend

# Copy environment variables
cp .env.local.example .env.local

# Update .env.local with your credentials

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Navigate to `http://localhost:3000`
2. Sign in with Google
3. Add a data source with an API URL
4. System automatically syncs and indexes the data
5. Chat with your data using natural language

See `QUICK_START.md` for detailed setup instructions.

## Project Structure

```
.
├── backend/          # Django REST API
├── frontend/         # Next.js application
├── README.md        # This file
└── QUICK_START.md   # Quick start guide
```

## License

MIT
