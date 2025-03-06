# Pocket Mixologist

A cocktail recommendation application with a conversational AI interface.

## Project Structure

- `/api` - Python FastAPI backend that interacts with the cocktail agent
- `/frontend` - Next.js frontend application with real-time chat interface

## Getting Started

### 1. Set up the API

```bash
cd pocket-mixologist/api

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your OpenAI API key
cp .env.example .env
# Edit the .env file with your OpenAI API key

# Start the API server
python api_server.py
```

### 2. Set up the Frontend

```bash
cd pocket-mixologist/frontend

# Install dependencies
npm install

# Create a .env.local file for the API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start the development server
npm run dev
```

### 3. Open the Application

Open [http://localhost:3000](http://localhost:3000) in your browser to use the Pocket Mixologist.

## Features

- Conversational interface for cocktail recommendations
- Custom cocktail creation based on user preferences
- Session management for persistent conversations
- Responsive design for mobile and desktop

## Technologies

- **Backend**: Python, FastAPI, LangGraph
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT models with LangGraph for stateful conversation flow

## Development

For detailed instructions on working with each part of the application:

- See the [API README](/api/README.md) for backend details
- See the [Frontend README](/frontend/README.md) for frontend details 