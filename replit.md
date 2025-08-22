# Overview

DorLog is a Progressive Web App (PWA) for health management, specializing in pain tracking, medication management, and healthcare provider coordination. It offers a mobile-first, light-mode interface with Firebase authentication and Firestore data storage. Key capabilities include comprehensive pain and crisis episode tracking, medication and doctor management with CRUD operations, and dynamic daily health quizzes. The application also features automated professional HTML report generation and deployment, designed for seamless sharing with healthcare providers. DorLog aims to empower users in managing their health data and facilitate better communication with their medical teams.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript, using **Vite** for build processes.
- **Wouter** for client-side routing and **TanStack Query** for data management.
- Styling is handled by **Tailwind CSS** with **shadcn/ui** components.
- **Mobile-first responsive design** ensures a unified experience across devices.

## UI/UX Design Patterns
- **Light mode only** with a high-contrast, accessible color scheme.
- Primary navigation uses **bottom navigation tabs** (Home, Doctors, Medications, Reports) and a **drawer-based side navigation** for settings.
- Features **card-based layouts** for content organization and **PWA capabilities** for offline support.
- Includes a **Dynamic Quiz System** for morning, night, and emergency crisis tracking, and an **Enhanced EVA Scale Component** for pain assessment.

## Backend Architecture
- **Express.js** server with TypeScript.
- **Drizzle ORM** for PostgreSQL database operations, with **Neon Database** as the provider.
- **RESTful API structure** under the `/api` prefix.

## Data Layer
- **PostgreSQL** for core application data.
- **Firestore** for user profiles, authentication, and specific collections:
    - `usuarios`: User data.
    - `assinaturas`: Subscription management.
    - `quizzes`: Dynamic quiz content.
    - `medicos`: Doctor information.
    - `medicamentos`: Medication management with doctor associations.
    - `report_diario`: Daily quiz responses and health reports.
- **Firebase Authentication** handles user logins (email/password, Google OAuth) and persistence.
- A **Subscription System** verifies user subscription status via the `assinaturas` collection.

## Development & Build Process
- Uses **ESM modules** and **path aliases** for clean imports.
- **GitHub Pages Deployment** for the client-only build via GitHub Actions.
- **Firebase Hosting for HTML Reports** is managed by an automated pipeline that generates, deploys, and cleans up reports, including unique URL generation for cache prevention.

## WhatsApp Sharing Strategy
- **Hybrid Multi-Platform Approach**: Implements intelligent device detection for optimal sharing experience across mobile and desktop platforms.
- **Strategy 1 - Mobile Native**: Uses Web Share API on mobile devices to present native contact selector, allowing users to choose specific contacts from their device's sharing interface.
- **Strategy 2 - Desktop Clipboard**: On desktop platforms, opens WhatsApp Web in a new tab while automatically copying the report message to clipboard, enabling users to navigate contacts freely and paste the message.
- **Strategy 3 - Fallback URI**: Traditional WhatsApp URI scheme for older devices or when other methods fail, maintaining broad compatibility.
- **Seamless Integration**: Works with the unified report generation system without requiring any backend modifications, fully compatible with GitHub Pages limitations.
- **User Experience**: Provides clear feedback through toast notifications explaining the action taken and guiding users through the sharing process on each platform.

# External Dependencies

## Firebase Services
- **Firebase Auth**: User authentication with email/password and Google OAuth.
- **Firestore**: Database for user data and real-time updates.
- **Firebase Storage**: Configured for future file upload capabilities.
- **Google Auth Provider**: For Google sign-in integration.
- **Firebase Configuration**: Now properly configured with environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_APP_ID, VITE_FIREBASE_PROJECT_ID).

## Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database operations.
- **connect-pg-simple**: PostgreSQL session store for Express.

## UI & Design System
- **shadcn/ui**: Pre-built accessible React components.
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Development Tools
- **Vite**: Build tool and development server.
- **TanStack Query**: Server state management.
- **Wouter**: Lightweight routing library.
- **React Hook Form**: Form state management and validation.