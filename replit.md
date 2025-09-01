# Overview

DorLog is a Progressive Web App (PWA) designed for comprehensive health management. It enables users to track pain, manage medications, and coordinate with healthcare providers. Key features include detailed tracking of pain and crisis episodes, full CRUD operations for medication and doctor management, dynamic daily health quizzes, and automated generation of professional HTML reports for easy sharing with medical professionals. The primary goal is to empower users in managing their health data and enhance communication with their healthcare teams.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
Developed with React 18 and TypeScript, using Vite for building. It employs Wouter for routing and TanStack Query for data management. Styling is handled by Tailwind CSS and shadcn/ui, ensuring a mobile-first, responsive, and light-mode-only interface with high-contrast, accessible colors. Navigation utilizes bottom tabs and a drawer-based side menu.

## Backend
An Express.js server in TypeScript manages the backend. It uses Drizzle ORM with Neon Database (PostgreSQL) for core application data.

## Data Layer
PostgreSQL stores primary application data. Firestore is used for user profiles, authentication, and specific collections including `usuarios`, `assinaturas` (subscriptions), `quizzes`, `medicos`, `medicamentos`, and `report_diario`. Firebase Authentication manages user logins (email/password, Google OAuth).

## Report Generation & Sharing
A unified client-side system generates professional HTML reports from Firestore data, uploading them to Firebase Storage for permanent public URLs. This system integrates a template engine for comprehensive medical reports, optimized for performance and cross-platform compatibility. Report sharing is handled via a hybrid multi-platform WhatsApp strategy, using Web Share API on mobile, clipboard integration for desktop, and a fallback URI scheme.

## UI/UX Design Patterns
The application features a light-mode-only interface with a high-contrast color scheme, bottom navigation tabs, drawer-based side navigation, and card-based layouts. It includes a dynamic quiz system for health tracking and an enhanced EVA Scale component for pain assessment.

# External Dependencies

## Firebase Services
- **Firebase Auth**: For user authentication (email/password, Google OAuth).
- **Firestore**: Primary NoSQL database for user-centric data.
- **Firebase Storage**: For storing generated HTML reports.

## Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.

## UI & Design System
- **shadcn/ui**: React components.
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Development Tools
- **Vite**: Build tool.
- **TanStack Query**: Server state management.
- **Wouter**: Routing library.
- **React Hook Form**: Form management and validation.