# Configuration Guide

## Required Credentials

This application requires the following external services:

### 1. Google OAuth (Authentication)
**Purpose**: User login and authentication

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - Add app name, user support email
   - Add developer contact email
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: RAG AI Agent
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:8000`
   - Authorized redirect URIs:
     - `http://localhost:8000/api/auth/google/callback`
7. Copy the Client ID and Client Secret

**Add to**:
- `backend/.env`: `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`
- `frontend/.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### 2. Supabase (PostgreSQL Database)
**Purpose**: Store users, data sources, and application data

**Setup Steps**:
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection details

**Add to `backend/.env`**:
```env
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=<your-password>
SUPABASE_DB_HOST=db.xxxxxxxxxxxxx.supabase.co
SUPABASE_DB_PORT=5432
```

### 3. Qdrant Cloud (Vector Database)
**Purpose**: Store and search vector embeddings

**Setup Steps**:
1. Sign up at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Create a new cluster
3. Copy the cluster URL and API key

**Add to `backend/.env`**:
```env
QDRANT_URL=https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east.aws.cloud.qdrant.io
QDRANT_API_KEY=your-api-key-here
```

### 4. Groq API (LLM)
**Purpose**: Generate AI responses using LLaMA 3.3

**Setup Steps**:
1. Sign up at [console.groq.com](https://console.groq.com)
2. Navigate to API Keys
3. Create a new API key

**Add to `backend/.env`**:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Environment Files

### backend/.env
Complete example:
```env
DJANGO_SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-password
SUPABASE_DB_HOST=db.xxxxxxxxxxxxx.supabase.co
SUPABASE_DB_PORT=5432

GOOGLE_OAUTH_CLIENT_ID=123456789-xxxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxx
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

QDRANT_URL=https://xxxxxxxx.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### frontend/.env.local
Complete example:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxxxx.apps.googleusercontent.com
```

## Security Notes

1. **Never commit .env files to Git** - They contain sensitive credentials
2. **Use strong secrets in production** - Generate a new DJANGO_SECRET_KEY
3. **Enable HTTPS in production** - Update ALLOWED_HOSTS and CORS settings
4. **Rotate API keys regularly** - Especially for production deployments

## Testing Configuration

To verify your configuration is correct:

1. **Test Backend**:
```bash
cd backend
python manage.py check
```

2. **Test Database Connection**:
```bash
python manage.py migrate
```

3. **Test Frontend Build**:
```bash
cd frontend
npm run build
```

## Troubleshooting

### Google OAuth Issues
- Verify Client ID matches in both backend and frontend
- Check authorized origins include both localhost:3000 and localhost:8000
- Ensure OAuth consent screen is configured

### Database Connection Issues
- Test Supabase connection from their dashboard
- Verify host includes "db." prefix
- Check password doesn't contain special characters that need escaping

### Qdrant Connection Issues
- Verify cluster is running in Qdrant Cloud dashboard
- Check API key has proper permissions
- Ensure URL includes https:// protocol

### Groq API Issues
- Verify API key is active
- Check you haven't exceeded rate limits
- Ensure proper API key format (starts with "gsk_")
