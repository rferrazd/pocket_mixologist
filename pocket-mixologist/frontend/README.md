# Pocket Mixologist Frontend

The Next.js frontend for the Pocket Mixologist cocktail recommendation application.

## Features

- Modern UI built with Next.js and TypeScript
- Real-time chat interface with the AI cocktail assistant
- Responsive design that works on mobile and desktop
- Dark mode support

## Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Pocket Mixologist API running (see `/api` directory)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Create a `.env.local` file with the API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app` - Main application code
  - `components/` - React components
    - `Chat.tsx` - Main chat container component
    - `Message.tsx` - Individual message component
    - `MessageInput.tsx` - Text input component
    - `MessageList.tsx` - Message list component
  - `services/` - API services
    - `api.ts` - API client functions
  - `page.tsx` - Main page component
  - `layout.tsx` - Root layout component

## Building for Production

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm run start
# or
yarn start
```

## Technologies Used

- Next.js - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Fetch API - API communication

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
