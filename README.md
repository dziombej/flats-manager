# flats-manager.pl

> A web application for landlords to efficiently manage multiple apartments, recurring payments, and debt monitoring.

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/yourusername/flats-manager)
[![Node](https://img.shields.io/badge/node-22.14.0-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
  - [Test Credentials](#test-credentials)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
  - [Key Features](#key-features)
  - [MVP Limitations](#mvp-limitations)
- [Project Status](#project-status)
- [License](#license)

## Description

**flats-manager** is a web application designed for landlords managing multiple apartments. It solves the problem of manually tracking payments for multiple properties through automation of monthly payment generation and centralization of financial data.

**Target Audience:**

- Landlords managing 2-10 apartments
- Users managing properties personally (without property managers)
- People needing a simple tool for tracking regular payments

**Main Benefits:**

- Save 2-3 hours monthly on administration
- Get immediate insight into the financial situation of all apartments
- Eliminate the risk of forgetting a payment
- Professional approach to property management

## Tech Stack

### Frontend

- **Astro 5** - Fast pages with server-side rendering
- **React 19** - Interactive components with Islands architecture
- **TypeScript 5** - Type safety and better IDE support
- **Tailwind 4** - Utility-first CSS framework
- **Shadcn/ui** - Ready-made accessible UI components

### Backend

- **Supabase** - PostgreSQL + Backend-as-a-Service + Authentication (open source, self-hosting capability)

### Testing

- **Vitest** - Unit and integration testing framework
- **React Testing Library** - Testing React components
- **Playwright** - End-to-end testing framework

### Deployment

- **GitHub Actions** - CI/CD pipeline
- **DigitalOcean** - Hosting with Docker

## Getting Started Locally

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** `22.14.0` (specified in `.nvmrc`)
  ```bash
  # Using nvm (recommended)
  nvm use
  ```
- **npm** or **pnpm** (package manager)
- **Supabase account** (for backend services)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dziombej/flats-manager.git
   cd flats-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

1. Create a `.env` file in the project root:

   ```bash
   cp .env.example .env
   ```

2. Configure your Supabase credentials in `.env`:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Database Setup

1. Set up the database schema in your Supabase project:
   - Create tables: `User`, `Flat`, `PaymentType`, `Payment`
   - Configure Row Level Security (RLS) policies
   - Set up foreign key constraints and check constraints

2. Run the seed script to create test users and sample data:
   - The seed creates 2 test users:
     - **User 1** (`admin@flatmanager.local`) - with 3 apartments and payment types
     - **User 2** (`test@flatmanager.local`) - without apartments

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:

   ```
   http://localhost:4321
   ```

3. Log in using one of the test credentials below.

### Test Credentials

Use these credentials to test the application:

**User 1 (with sample data):**

- Email: `admin@flatmanager.local`
- Password: `password123`
- Has 3 apartments with payment types and some generated payments

**User 2 (empty account):**

- Email: `test@flatmanager.local`
- Password: `password123`
- Has no apartments (clean slate for testing)

## Available Scripts

| Script     | Command            | Description                              |
| ---------- | ------------------ | ---------------------------------------- |
| `dev`      | `npm run dev`      | Start development server with hot reload |
| `build`    | `npm run build`    | Build the application for production     |
| `preview`  | `npm run preview`  | Preview production build locally         |
| `astro`    | `npm run astro`    | Run Astro CLI commands                   |
| `lint`     | `npm run lint`     | Run ESLint to check code quality         |
| `lint:fix` | `npm run lint:fix` | Run ESLint and automatically fix issues  |
| `format`   | `npm run format`   | Format code with Prettier                |

## Project Scope

### Key Features

✅ **Apartment Management**

- Create, read, update, and delete apartments
- Track apartment name and address
- View debt overview per apartment

✅ **Payment Type Management**

- Define recurring payment types for each apartment (e.g., Rent, Utilities)
- Set base amount for each payment type
- Edit payment type details

✅ **Payment Generation & Tracking**

- Automatically generate monthly payment instances for all payment types
- Track payment status (paid/unpaid)
- Mark payments as paid with timestamp
- Filter payments by month and year

✅ **Dashboard & Reporting**

- Overview of all apartments with debt calculations
- Real-time debt monitoring (sum of unpaid payments)
- Quick access to apartment details
- Default view shows all unpaid payments

✅ **Security**

- Email/password authentication
- Row Level Security (RLS) - users see only their own data
- Hashed password storage

### MVP Limitations

⚠️ **Not included in current MVP:**

- ❌ User registration (users are seeded)
- ❌ Mobile responsiveness (desktop only, min-width: 1024px)
- ❌ Password reset functionality
- ❌ Multi-currency support (PLN assumed by default)
- ❌ Tenant management
- ❌ Advanced reports and exports (PDF, Excel)
- ❌ Payment notifications and reminders
- ❌ Automatic monthly payment generation (manual process)
- ❌ Payment type deactivation or deletion
- ❌ Editing or deleting payments
- ❌ Deletion confirmations

**Technical Simplifications:**

- No pagination (designed for 2-10 apartments)
- No advanced caching
- Basic validation only
- No test coverage in MVP

## Project Status

🚧 **Current Phase:** MVP Development

**Implemented:**

- ✅ Authentication system with test users
- ✅ Apartment CRUD operations
- ✅ Payment type management
- ✅ Monthly payment generation
- ✅ Payment status tracking
- ✅ Dashboard with debt overview
- ✅ Row Level Security policies
- ✅ Database constraints and validation

**Acceptance Criteria Met:**

- All 44 user stories implemented
- Functional requirements from PRD satisfied
- 2 test users can fully use the application
- System correctly calculates debt and prevents duplicates
- Code ready for further development

**Future Enhancements (Post-MVP):**

- User registration and password management
- Mobile responsiveness
- Advanced payment management (partial payments, overpayments)
- Tenant management
- Reporting and export features
- Automated payment generation
- Email notifications
- Multi-currency support

---

**Note:** This is an MVP (Minimum Viable Product) designed for desktop use only. For questions, issues, or feature requests, please open an issue on GitHub.
