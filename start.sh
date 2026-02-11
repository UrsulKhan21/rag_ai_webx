#!/bin/bash

echo "Starting RAG AI Agent..."
echo ""

# Check if backend .env exists
if [ ! -f backend/.env ]; then
    echo "Error: backend/.env not found. Please copy backend/.env.example and configure it."
    exit 1
fi

# Check if frontend .env.local exists
if [ ! -f frontend/.env.local ]; then
    echo "Error: frontend/.env.local not found. Please copy frontend/.env.local.example and configure it."
    exit 1
fi

# Start backend in background
echo "Starting Django backend..."
cd backend
source venv/bin/activate 2>/dev/null || true
python manage.py runserver > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo "Starting Next.js frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "Services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo ""
echo "Logs:"
echo "  Backend: backend.log"
echo "  Frontend: frontend.log"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
