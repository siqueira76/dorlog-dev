# Overview

DorLog is a Progressive Web App (PWA) designed for health management, specifically focused on pain tracking, medication management, and healthcare provider coordination. The application is built as a mobile-first experience that works seamlessly across devices, featuring a clean, light-mode interface with Firebase authentication and Firestore data storage.

## Current Status
- Firebase authentication fully implemented (email/password + Google OAuth)
- User persistence working perfectly in "usuarios" collection with proper security rules
- Robust error handling and fallback authentication system implemented
- Enhanced input validation with clear user feedback messages
- Mobile-first UI with bottom navigation and drawer menu completed
- All core pages implemented (Home, Profile, Doctors, Medications, Reports)
- Console errors eliminated and clean development environment achieved
- **FIRESTORE INTEGRATION COMPLETE** - Users being saved and retrieved successfully
- **SUBSCRIPTION SYSTEM IMPLEMENTED** - Active subscription verification via "assinaturas" collection
- Profile page displays subscription status with appropriate badges and call-to-action buttons
- Home page updated with "Registrar Crise" button (August 6, 2025)
- **QUIZ SYSTEM IMPLEMENTED** - Dynamic quiz functionality with modular question rendering
- Quiz matinal accessible from Home page "Diário Manhã" button (August 13, 2025)
- **QUIZ NOTURNO IMPLEMENTED** - Night diary quiz accessible from "Diário Noite" button (August 13, 2025)
- **QUIZ EMERGENCIAL IMPLEMENTED** - Emergency crisis quiz accessible from "Registrar Crise" button (August 13, 2025)
- Firebase security rules configuration required for quiz access - see CONFIGURACAO_FIREBASE_REGRAS.md

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and data fetching
- **Tailwind CSS** with **shadcn/ui** components for styling
- **Mobile-first responsive design** with unified mobile/desktop experience

## Authentication & User Management
- **Firebase Authentication** supporting:
  - Email/password registration and login
  - Google OAuth integration via `signInWithPopup`
  - User profile management (name, email updates)
  - Password change functionality
- **Firestore** for user data persistence with real-time synchronization
- **AuthContext** providing centralized authentication state management
- **Subscription System** with automatic verification:
  - Checks "assinaturas" collection using user's email as document ID
  - Validates subscription date (past date = active subscription)
  - Updates user profile with subscription status flag
  - Real-time subscription status updates on login

## UI/UX Design Patterns
- **Light mode only** with high contrast, accessible color scheme
- **Bottom navigation tabs** as primary navigation (Home, Doctors, Medications, Reports)
- **Drawer-based side navigation** for user settings and profile access
- **Consistent header component** with menu toggle across all authenticated pages
- **Card-based layouts** for content organization
- **Progressive Web App** capabilities with offline support
- **Dynamic Quiz System** with modular question rendering supporting multiple question types
  - Morning diary quiz (matinal) - Daily health and wellness tracking
  - Night diary quiz (noturno) - End-of-day reflection and symptoms assessment  
  - Emergency crisis quiz (emergencial) - Immediate pain crisis documentation
- **Enhanced EVA Scale Component** with interactive visual design, drag functionality, and improved UX

## Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** configured for PostgreSQL database operations
- **Neon Database** as the PostgreSQL provider
- **Memory storage fallback** for development/testing scenarios
- **RESTful API structure** with `/api` prefix routing

## Data Layer
- **PostgreSQL** database with Drizzle schema management
- **Firestore** for user profiles and authentication-related data
  - "usuarios" collection for user data
  - "assinaturas" collection for subscription management
  - "quizzes" collection for dynamic quiz content and metadata
- **Firebase Storage** for file uploads (configured but not yet implemented)
- **Session management** using PostgreSQL-backed sessions

## Development & Build Process
- **ESM modules** throughout the application
- **Shared schema** between client and server using Drizzle
- **Path aliases** for clean imports (`@/`, `@shared/`)
- **Development hot reload** with Vite middleware integration
- **Production build** with static asset serving

# External Dependencies

## Firebase Services
- **Firebase Auth** - User authentication and session management
- **Firestore** - User profile data storage and real-time updates  
- **Firebase Storage** - File upload capabilities (configured for future use)
- **Google Auth Provider** - OAuth integration for Google sign-in

## Database & ORM
- **Neon Database** - Serverless PostgreSQL hosting
- **Drizzle ORM** - Type-safe database operations and schema management
- **connect-pg-simple** - PostgreSQL session store for Express

## UI & Design System
- **shadcn/ui** - Pre-built accessible React components
- **Radix UI** - Headless UI primitives for complex components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library for consistent iconography

## Development Tools
- **Vite** - Fast build tool and development server
- **TanStack Query** - Server state management and caching
- **Wouter** - Lightweight routing library
- **React Hook Form** - Form state management and validation