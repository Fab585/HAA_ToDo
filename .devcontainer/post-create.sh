#!/bin/bash
set -e

echo "🚀 Running post-create setup..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install pre-commit hooks
echo "🪝 Installing pre-commit hooks..."
pre-commit install

# Set up git config (if not already set)
if [ -z "$(git config --global user.name)" ]; then
    echo "⚠️  Git user.name not set. Please configure git:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
fi

echo "✅ Post-create setup complete!"
echo ""
echo "🎯 Quick start commands:"
echo "   Python tests:    pytest"
echo "   Python lint:     ruff check ."
echo "   Frontend dev:    cd frontend && npm run dev"
echo "   Frontend test:   cd frontend && npm test"
echo ""
