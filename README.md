# FitTrack - Multilingual Fitness Tracking App

## Overview

FitTrack is a comprehensive fitness tracking application built with React, TypeScript, and Express.js that helps users track their workouts, maintain exercise records, and receive AI-powered fitness advice. The application supports both English and Japanese languages and integrates with Google's Gemini AI for personalized coaching.

## Features

- **User Authentication**: Secure login and registration system
- **Workout Tracking**: Create, view, and manage workouts
- **Exercise Library**: Comprehensive database of exercises
- **Progress Monitoring**: Track your fitness progression over time
- **AI Coaching**: Get personalized workout and nutrition advice using Google's Gemini AI
- **Multilingual Support**: Full internationalization with English and Japanese languages

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Gemini AI (requires API key)
- **Internationalization**: i18next for multilingual support

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Gemini API key

### Environment Variables

Create a `.env` file in the root directory with the following:

```
DATABASE_URL=postgresql://username:password@localhost:5432/fittrack
GEMINI_API_KEY=your_gemini_api_key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5000`

## AI Coaching

The AI coach feature uses Google's Gemini API to provide personalized fitness advice. The system:

- Responds in the user's selected language (English or Japanese)
- Provides workout recommendations based on goals
- Offers nutrition advice and form tips
- Adapts to the user's workout history

## Internationalization

The app supports complete internationalization:

- Switch between English and Japanese using the language selector
- All UI elements, form fields, and error messages are localized
- AI coaching responds in the selected language
- Date formats adapt to the locale

## Project Structure

- `/client`: React frontend application
  - `/src/components`: UI components
  - `/src/pages`: Application pages
  - `/src/hooks`: Custom React hooks
  - `/src/i18n`: Internationalization configuration and translations
- `/server`: Express.js backend
  - `/auth.ts`: Authentication logic
  - `/gemini.ts`: AI integration with Google Gemini
  - `/routes.ts`: API endpoints
  - `/storage.ts`: Database interaction
- `/shared`: Code shared between frontend and backend
  - `/schema.ts`: Database schema and types

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini for AI capabilities
- Shadcn UI for the component library
- i18next for internationalization support