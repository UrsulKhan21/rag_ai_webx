#!/bin/bash

echo "Setting up Django backend..."

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update .env with your actual credentials"
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Creating superuser (optional)..."
read -p "Do you want to create a superuser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  python manage.py runserver"
