# Overview

DorLog is a Progressive Web App (PWA) designed for health management, specifically focused on pain tracking, medication management, and healthcare provider coordination. The application is built as a mobile-first experience that works seamlessly across devices, featuring a clean, light-mode interface with Firebase authentication and Firestore data storage.

## Current Status
- **FIREBASE HOSTING REPORTS SYSTEM IMPLEMENTED** - Complete automated HTML report generation and deployment system (August 20, 2025)
  - Firebase Hosting structure created with reports/, assets/, and usuarios/ directories
  - Automated report generation script with deploy automation (`generate_and_send_report.cjs`)
  - Professional HTML report templates with responsive design and print optimization
  - API endpoints for report generation (/api/generate-report, /api/generate-monthly-report)
  - Deploy automation script (`deploy.sh`) with comprehensive error handling
  - Complete documentation and setup guide (`FIREBASE_HOSTING_SETUP.md`)
- **PROJECT SUCCESSFULLY MIGRATED TO REPLIT** - Complete migration from Replit Agent environment to standard Replit with full functionality (August 20, 2025)
  - All dependencies properly installed and configured
  - PostgreSQL database provisioned and schema applied
  - Firebase credentials configured and working with all collections
  - Authentication system fully functional with user login/logout
  - All pages and features working correctly
  - Reports page button updated to "Gerar Relatorio Mensal"
- **CRISIS EPISODES TRACKING IMPLEMENTED** - Reports page now displays crisis episodes count for last 30 days (August 19, 2025)
- **GITHUB PAGES DEPLOYMENT CONFIGURED** - Automated deployment setup with GitHub Actions (August 18, 2025)
- **FIREBASE CONFIGURATION COMPLETE** - All environment variables properly configured for production Firebase project "dorlog-fibro-diario"
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
- **MODERN CHECKBOX UX IMPLEMENTED** - Enhanced mobile-first checkbox components with card-based design, haptic feedback, and improved accessibility (August 13, 2025)
- **ENHANCED QUIZ NAVIGATION** - Integrated próximo/anterior buttons directly within question cards for better mobile visibility and accessibility, with haptic feedback and progress indicators (August 13, 2025)
- **DOCTORS MANAGEMENT IMPLEMENTED** - Complete doctor registration and listing functionality with Firebase persistence (August 16, 2025)
  - Doctor registration form with validation (nome, especialidade, crm, contato optional)
  - Doctor list display with real-time Firebase data fetching
  - Proper error handling and loading states
  - Mobile-first responsive design with contact information display
- **MEDICATIONS MANAGEMENT IMPLEMENTED** - Complete medication registration and listing functionality with Firebase persistence (August 16, 2025)
  - Medication registration form with validation (all fields mandatory)
  - Doctor dropdown selection with real-time doctor data fetching
  - Medication list display with doctor name resolution
  - Reminder time functionality and frequency tracking
  - Proper error handling and loading states with mobile-first design
- **CRUD OPERATIONS COMPLETE** - Full delete and update functionality implemented for doctors and medications (August 17, 2025)
  - Edit dialog forms with pre-populated data for both doctors and medications
  - Delete confirmation dialogs with proper user feedback
  - Real-time data refresh after operations
  - Mobile-first responsive design for all CRUD operations
- **QUIZ PERSISTENCE IMPLEMENTED** - Quiz responses now saved to Firebase report_diario collection (August 17, 2025)
  - Automatic data/timestamp population from system
  - Single daily report_diario document per user with quiz array structure
  - Update existing quiz if same type submitted multiple times per day
  - Proper error handling and loading states during save process
  - Document ID format: {email}_{YYYY-MM-DD}
- **AUTOMATIC REMINDER RESET SYSTEM IMPLEMENTED** - Daily automatic reset of medication reminders to false status (August 17, 2025)
  - ReminderService class with daily reset functionality
  - Automatic verification and reset when user logs in or accesses medications page
  - Batch operations for atomic updates to all user medications
  - Date tracking (lastReset field) to prevent multiple resets per day
  - Error handling and logging for troubleshooting
  - Backend endpoint /api/reset-reminders for manual reset if needed
- **MEDICATION REMINDER INTERFACE ENHANCED** - Individual reminder management with visual status indicators (August 17, 2025)
  - Individual "Tomar/Tomado" buttons for each reminder with color coding (red=pending, green=taken)
  - Real-time status updates with loading states during Firebase operations
  - Progress counter showing X/Y reminders taken per medication
  - Card background colors indicating completion status (green=complete, red=pending)
  - Preserved reminder status during medication edits (fixed bug where status was reset)
- **IMPROVED REPORT_DIARIO MEDICATION PERSISTENCE** - Enhanced medication tracking with duplicate prevention (August 18, 2025)
  - Prevents duplicate medication entries in the same daily report_diario document
  - Updates frequency array with new dose times and status instead of creating duplicates
  - Once marked as "taken", status cannot be manually changed - only automatic daily reset
  - Improved data structure with frequency tracking per medication per day
  - Better error handling and user feedback for medication status changes
- **MONTHLY PDF REPORT GENERATOR IMPLEMENTED** - Complete monthly report generation feature with mobile-first design (August 20, 2025)
  - Monthly report generator page accessible via /reports/monthly-generator route
  - Two selection modes: single month and date range (De/Até)
  - Current month auto-selected as default on page load
  - Smart date filtering (end date shows only months after start date)
  - Mobile-optimized interface with larger touch targets and improved spacing
  - PDF generation, WhatsApp sharing, and email sharing functionality
  - Enhanced preview system showing selected period and month count
  - Direct access button from Reports page header for quick navigation
- Firebase security rules configuration required for quiz, medicos, medicamentos, and report_diario access - see CONFIGURACAO_FIREBASE_REGRAS.md

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
  - "medicos" collection for doctor information management
  - "medicamentos" collection for medication management with doctor associations
  - "report_diario" collection for daily quiz responses and health reports
- **Firebase Storage** for file uploads (configured but not yet implemented)
- **Session management** using PostgreSQL-backed sessions

## Development & Build Process
- **ESM modules** throughout the application
- **Shared schema** between client and server using Drizzle
- **Path aliases** for clean imports (`@/`, `@shared/`)
- **Development hot reload** with Vite middleware integration
- **Production build** with static asset serving
- **GitHub Pages Deployment** with automated GitHub Actions workflow
  - Client-only build for static hosting
  - Automatic deployment on push to main branch
  - Firebase environment variables configured in GitHub Secrets
- **Firebase Hosting for HTML Reports** with complete automation pipeline
  - Automated generation, deployment, and cleanup system (`generate_and_send_report.cjs`)
  - Professional report templates with responsive design and print optimization
  - API endpoints for report generation (/api/generate-report, /api/generate-monthly-report)
  - Deploy automation script (`deploy.sh`) with comprehensive error handling
  - Complete documentation (`FIREBASE_HOSTING_SETUP.md`)

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