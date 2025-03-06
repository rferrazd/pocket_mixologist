# Pocket Mixologist UI

A modern, elegant UI for the LangGraph Cocktail Agent. This Next.js application provides a beautiful interface for interacting with the cocktail recommendation system.

## Features

- Dark, sensual theme inspired by upscale cocktail bars
- Responsive chat interface for interacting with the mixologist
- Beautiful cocktail recipe display
- Markdown support for rich text formatting
- API integration ready to connect with the Python LangGraph backend

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Connecting to the LangGraph Backend

This UI is designed to connect with the Python LangGraph cocktail agent. To integrate with the backend:

1. Update the API routes in `src/app/api/chat/route.ts` to call your Python backend.
2. Ensure the response format matches the expected structure.

## Tech Stack

- Next.js 14
- React 18
- TailwindCSS
- React Markdown for formatting

## Styling

The design uses a custom color palette in the Tailwind configuration:

- Dark: Almost black with a hint of red
- Primary: Deep, sensual red
- Secondary: Gold/bronze
- Accent: True gold
- Light: Wheat/cream color

## License

MIT 