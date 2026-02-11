# Quick Start Guide

## Prerequisites

Before you begin, make sure you have:
- Python 3.12+ installed
- Node.js 18+ installed
- Accounts created for:
  - Google Cloud Console (for OAuth)
  - Qdrant Cloud
  - Groq API
  - Supabase

## Step 1: Clone and Setup

```bash
# Navigate to project directory
cd rag_ai_webx
```

## Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

Now edit `backend/.env` and add your credentials:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Get from Supabase dashboard
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-password
SUPABASE_DB_HOST=db.xxxxx.supabase.co
SUPABASE_DB_PORT=5432

# Get from Google Cloud Console
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret

# Get from Qdrant Cloud
QDRANT_URL=https://xxxxx.qdrant.io
QDRANT_API_KEY=your-api-key

# Get from Groq Console
GROQ_API_KEY=your-groq-api-key
```

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

Backend is now running at `http://localhost:8000`

## Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
```

```bash
# Start frontend server
npm run dev
```

Frontend is now running at `http://localhost:3000`

## Step 4: Test the Application

1. Open browser to `http://localhost:3000`
2. Click "Sign in with Google"
3. After login, click "Add Data Source"
4. Try this test API: `https://dummyjson.com/products`
5. Name it "Test Products" and click "Add Source"
6. Wait for sync to complete
7. Click "Chat" and ask: "What products are available?"

## Common Issues

### Backend won't start
- Make sure virtual environment is activated
- Check that all credentials in `.env` are correct
- Verify PostgreSQL connection to Supabase

### Frontend won't start
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Check `.env.local` has correct values

### Google OAuth not working
- Verify Client ID matches in both backend and frontend `.env` files
- Check authorized origins in Google Cloud Console include `http://localhost:3000` and `http://localhost:8000`

### Can't sync data source
- Verify Qdrant Cloud credentials
- Check that API URL is accessible
- Look at backend terminal for error messages

## Next Steps

- Add more data sources
- Customize the UI theme
- Deploy to production (see README.md)
- Explore the Django admin at `http://localhost:8000/admin`
