# Pocket Mixologist

An AI-powered cocktail recommendation app. This application features a language model-based agent that helps users discover personalized cocktail recipes based on their preferences, available ingredients, and taste profile.

## Project Structure

This project consists of two main parts:

1. **API Backend** (in the `/api` directory)
   - FastAPI server that interacts with the LangGraph cocktail agent
   - Handles the conversation flow with the agent

2. **Frontend** (in the `/frontend` directory)
   - Next.js application with TypeScript and Tailwind CSS
   - Beautiful UI for interacting with the cocktail agent

## Setup Instructions

### Backend Setup

1. Navigate to the API directory:
   ```
   cd pocket-mixologist/api
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a .env file based on .env.example and add your API keys

5. Start the API server:
   ```
   uvicorn api_server:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd pocket-mixologist/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Click on "Craft Your Cocktail" to start a conversation with the mixologist
3. Describe your preferences, and the agent will suggest cocktails tailored to your taste

## Features

- Real-time conversation with an AI cocktail agent
- Personalized cocktail recommendations
- Beautiful, responsive UI with animations
- Easy to set up and deploy

## Technologies Used

- **Backend**: Python, FastAPI, LangGraph
- **Frontend**: Next.js, TypeScript, Tailwind CSS, React 