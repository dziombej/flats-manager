As an experienced QA engineer, after thorough analysis of the provided code and project structure, I present a comprehensive test plan for the "Flats Manager" application.

---

# Test Plan for "Flats Manager" Project

---

## 1. Introduction and Testing Objectives

### 1.1. Introduction

This document describes the strategy, scope, resources, and schedule of testing activities for the "Flats Manager" application. The application is a web system based on Astro architecture with interactive React components, designed for managing rental properties, specifically for tracking payments and debt. The plan's goal is to ensure a systematic approach to software quality verification.

### 1.2. Testing Objectives

The main goal of the testing process is to ensure that the "Flats Manager" application meets business and technical requirements and is reliable, secure, and usable.

**Detailed objectives:**

- **Functional verification:** Confirmation that all functions, from authentication to payment management, work according to specification.
- **Security assurance:** Verification that user data is isolated and protected from unauthorized access.
- **Usability assessment (UX/UI):** Ensuring that the user interface is intuitive, consistent, and responsive across different devices.
- **Defect identification and reporting:** Early detection of errors to minimize repair costs.
- **Data integrity validation:** Checking whether data operations (e.g., debt calculation, payment generation) produce correct and consistent results.
- **Deployment readiness confirmation:** Determining whether the application has achieved a quality level enabling its deployment to production environment.

---

## 2. Test Scope

### 2.1. Functionalities covered by tests

Tests will cover all key modules and application functionalities:

- **Authentication and Authorization Module:**
  - New user registration.
  - Login and logout.
  - Route protection (middleware) - access to individual application sections depending on login status.
  - Redirects for logged-in and non-logged-in users.
- **Flats Management Module:**
  - Creating new flat (CRUD - Create).
  - Displaying flats list (CRUD - Read).
  - Displaying flat details (CRUD - Read).
  - Editing flat data (CRUD - Update).
  - Deleting flat along with related data (payments, payment types) (CRUD - Delete).
- **Payment Types Management Module:**
  - Adding payment types (e.g., rent, utilities) to specific flat.
  - Editing existing payment types.
  - Displaying payment types list in flat details.
- **Payments Management Module:**
  - Generating monthly payments based on defined types.
  - Displaying payments list with filtering capability.
  - Marking payment as "paid".
  - Automatic marking of payments as "overdue".
- **Dashboard:**
  - Displaying general statistics (total number of flats, total debt).
  - Displaying flats grid with debt information.
  - Search, sort, and filter functionalities on flats list.
- **User Interface (UI):**
  - View responsiveness on mobile and desktop devices.
  - Theme toggle (light/dark).
  - Handling loading states (skeletons) and errors.

### 2.2. Functionalities excluded from tests

- Testing Supabase infrastructure (database performance, Supabase API operation).
- Testing external libraries (e.g., Radix UI, clsx) beyond the context of their implementation in the application.
- Penetration testing and advanced security testing (may be subject of a separate plan).

---

## 3. Test Types

The following test types will be conducted in the project:

- **Unit Tests:**
  - **Goal:** Verification of correct operation of individual React components, helper functions (utils), and data transformers in isolation.
  - **Scope:** Validation logic in forms, formatting functions (`formatCurrency`), data transformers (`transformFlatDetailData`), UI components logic.
- **Integration Tests:**
  - **Goal:** Checking correct cooperation between different parts of the system.
  - **Scope:**
    - Testing service layer (`FlatsService`, `AuthService`) with mocked Supabase client to verify business logic.
    - Testing API endpoints to check validation, error handling, and correct communication with service layer.
- **End-to-End (E2E) Tests:**
  - **Goal:** Simulation of real application usage scenarios from end user's perspective, verifying entire data flow from interface to database.
  - **Scope:** Complete user paths, e.g., "registration -> login -> add flat -> add payment type -> generate payment -> check debt on dashboard -> pay payment -> logout".
- **Security Tests:**
  - **Goal:** Verification of key security aspects, especially data isolation.
  - **Scope:** E2E tests checking whether user A has no access (to read, modify, delete) to resources (flats, payments) of user B.
- **Manual and Exploratory Tests:**
  - **Goal:** Verification of usability (UX), visual consistency (UI), and discovering unforeseen errors.
  - **Scope:** Responsiveness, operation on different browsers, general interface intuitiveness.
- **Regression Tests:**
  - **Goal:** Ensuring that new changes haven't broken existing functionalities.
  - **Scope:** Running automated test suite (E2E and integration) after each major code change and before each deployment.

---

## 4. Test Scenarios (Examples)

Below are key test scenarios with high priority.

| Module                       | Scenario ID | Description                                                                                                                                       | Priority |
| :--------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------- |
| **Authentication**           | AUTH-01     | User can successfully register an account using valid email and password.                                                                         | Critical |
|                              | AUTH-02     | User can log into existing account and be redirected to dashboard.                                                                                | Critical |
|                              | AUTH-03     | Non-logged-in user trying to access `/dashboard` is redirected to login page.                                                                     | Critical |
|                              | AUTH-04     | System displays readable error message when attempting to log in with incorrect credentials.                                                      | High     |
| **Data Isolation**           | SEC-01      | Logged-in user A, knowing user B's flat ID, cannot view its details (neither through UI nor direct API request).                                  | Critical |
|                              | SEC-02      | Logged-in user A cannot modify or delete data belonging to user B.                                                                                | Critical |
| **Flats Management**         | FLAT-01     | User can create new flat by providing valid name and address.                                                                                     | Critical |
|                              | FLAT-02     | User can edit existing flat data.                                                                                                                 | High     |
|                              | FLAT-03     | User can delete flat, which results in deletion of all related payment types and payments.                                                        | High     |
| **Payments**                 | PAY-01      | User can add new payment type (e.g., "Rent", 2000 PLN) to flat.                                                                                   | Critical |
|                              | PAY-02      | System correctly generates payments for selected month and year for all defined payment types.                                                    | Critical |
|                              | PAY-03      | Debt amount on dashboard and in flat details is correctly calculated as sum of all unpaid payments.                                               | Critical |
|                              | PAY-04      | User can mark payment as "paid", which updates its status and debt amount.                                                                        | High     |
| **Dashboard**                | DASH-01     | Filters (by debt status) and sorting (e.g., by debt descending) on flats list work correctly.                                                     | Medium   |

---

## 5. Test Environment

- **Development environment (local):** Used by developers to run unit and integration tests.
- **Staging environment:** Cloned production infrastructure with separate Supabase database instance. This environment will be used to conduct E2E, manual, and regression tests. The database on this environment will be regularly cleaned and populated with a defined set of test data (test data seed).
- **Browsers:** Tests will be performed on the latest browser versions:
  - Google Chrome
  - Mozilla Firefox
  - Safari

---

## 6. Testing Tools

- **Framework for unit and integration tests:** **Vitest** with **React Testing Library** for testing React components.
- **Framework for E2E tests:** **Playwright** or **Cypress** for browser scenario automation.
- **API/Database Mocking:** **`supabase-mock`** or custom mocks for testing service layer in isolation.
- **CI/CD:** **GitHub Actions** for automatic running of test suites (unit, integration, E2E) after each push to `main` branch and when creating Pull Requests.
- **Test and Bug Management:** **Jira** / **Asana** / **GitHub Issues** for creating and tracking test scenarios and reporting and managing bug lifecycle.

---

## 7. Test Schedule

The testing process will be conducted in parallel with the development process within sprints.

| Phase                             | Activities                                                                                                                                                                               | Duration   |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| **During sprint**                 | Unit and integration testing of new functionalities (by developers).<br>Creating and updating E2E tests (by QA).<br>Exploratory testing of new functionalities (by QA).                 | Continuous |
| **Before deployment (Code Freeze)** | Full automated regression (E2E).<br>Key manual tests (Smoke Tests).<br>Verification of fixed bugs.                                                                                      | 1-2 days   |
| **After deployment**              | Verification tests on production environment (Sanity Tests).                                                                                                                             | 2-4 hours  |

---

## 8. Test Acceptance Criteria

### 8.1. Entry Criteria

- A stable version of the application is available on Staging environment.
- All new functionalities have been implemented and passed unit tests.
- Technical documentation or requirements description is available for tested functionalities.

### 8.2. Exit Criteria (Definition of Done)

- **100%** of test scenarios with **Critical** priority executed and completed successfully.
- **95%** of test scenarios with **High** priority executed and completed successfully.
- No known bugs with **Critical** and **High** priority.
- All found bugs are reported and assessed by the team.
- Automated regression tests complete successfully.

---

## 9. Roles and Responsibilities

| Role                       | Responsibilities                                                                                                                                                                                                                       |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **QA Engineer**            | Creating and maintaining test plan, designing and implementing automated tests (integration, E2E), conducting manual and exploratory tests, reporting and managing bugs, coordinating UAT process.                                     |
| **Developers**             | Writing unit tests for their code, fixing reported bugs, supporting bug root cause analysis, maintaining test functionality in CI/CD.                                                                                                  |
| **Product Owner / Manager** | Defining acceptance criteria for functionalities, participating in User Acceptance Testing (UAT), prioritizing bug fixes.                                                                                                              |

---

## 10. Bug Reporting Procedures

Each identified bug must be reported in the bug tracking system (e.g., Jira) and should contain the following information:

- **Title:** Concise and unambiguous problem description.
- **Environment:** Where the bug occurred (e.g., Staging, Chrome v1xx).
- **Application version/Commit:** Identifier of tested version.
- **Priority/Severity:**
  - **Critical:** Blocks operation of key functions, causes data loss.
  - **High:** Significantly hinders use of important function, but workaround exists.
  - **Medium:** Bug in secondary function operation or UI/UX issue.
  - **Low:** Minor visual bug, typo.
- **Steps to reproduce:** Numbered list of steps allowing unambiguous bug reproduction.
- **Expected result:** How the system should behave.
- **Actual result:** How the system actually behaved.
- **Attachments:** Screenshots, video recordings, console logs.
