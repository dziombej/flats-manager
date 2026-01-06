# Product Requirements Document (PRD) - flat-manager

## 1. Product Overview

flat-manager is a web application designed for landlords managing multiple apartments, enabling efficient management of recurring payments and debt monitoring. The application solves the problem of manually tracking payments for multiple properties through automation of monthly payment generation and centralization of financial data.

MVP scope includes:

- Multi-apartment management (CRUD)
- Defining recurring payment types for each apartment
- Automatic generation of monthly payment instances
- Payment status tracking (paid/unpaid)
- Dashboard with debt overview per apartment
- Payment filtering by month and year

Main technologies:

- Frontend: Astro with React Islands (TypeScript)
- Backend: Supabase (PostgreSQL with Row Level Security)
- Architecture: Server-side rendering with selective hydration

Target audience:

- Landlords managing 2-10 apartments
- Users managing properties personally (without property managers)
- People needing a simple tool for tracking regular payments

Key MVP limitations:

- Desktop only (min-width: 1024px)
- No registration (users are seeded)
- No advanced reports and exports
- No tenant management
- Single currency (PLN assumed by default)

## 2. User Problem

Landlords managing multiple apartments face the following challenges:

Lack of centralized payment tracking system

- Landlords use spreadsheets, notes, or memory to track payments
- Difficulty in quickly determining which apartment has arrears
- Risk of missing payments or double charging

Time-consuming creation of monthly settlements

- Manual copying of amounts for each apartment every month
- Need to remember all payment types for each property
- Susceptibility to errors during manual data entry

Difficulties in monitoring debt

- Lack of quick overview of the apartment portfolio's financial situation
- Need to manually sum up to see total debt
- No history of which payments were made and when

Consequences of problems:

- Time wasted on administration instead of business development
- Financial risk due to unenforced payments
- Stress related to chaotic documentation
- Lack of professionalism in tenant relationships

Value of the solution:

- Savings of 2-3 hours monthly on administration
- Immediate insight into the financial situation of all apartments
- Elimination of the risk of forgetting a payment
- Professional approach to property management

## 3. Functional Requirements

### 3.1. Authentication and Security

REQ-AUTH-001: Login System

- User logs in using email and password
- Passwords are hashed before saving to database
- User session is maintained until logout
- After login, user is redirected to dashboard

REQ-AUTH-002: Logout System

- Logged-in user can log out at any time
- Logout ends the session and redirects to login page

REQ-AUTH-003: Row Level Security

- User sees only their own apartments and related data
- RLS policies are implemented should be omitted in MVP

REQ-AUTH-004: User Seeding

- System initializes database with two test users
- User 1: admin@flatmanager.local / password123 (with 3 apartments)
- User 2: test@flatmanager.local / password123 (without apartments)
- Credentials are documented in README.md

REQ-AUTH-005: Landing page

- Unauthenticated users see a landing page with app description
- Landing page contains login button redirecting to login page
- There should be possibility to reset password (email sending not required)

REQ-AUTH-006: Registration page

- Unauthenticated users can register new account
- Required fields: email (unique), password (min 8 chars)
- After registration, user is redirected to login page
- No email verification in MVP
- New user has no apartments by default
- Password is hashed before saving
- Validation: email format, password length
- Success message after registration
- Error messages for duplicate email or validation failures
- No multi-factor authentication in MVP

### 3.2. Apartment Management

REQ-FLAT-001: Adding Apartment

- User can add new apartment by providing name and address
- Required fields: name (string), address (string)
- After adding apartment, user is redirected to its details
- New apartment is immediately visible on dashboard

REQ-FLAT-002: Displaying Apartment List

- Dashboard displays list of all user's apartments
- For each apartment shown: name, address, debt
- List is sorted alphabetically by name

REQ-FLAT-003: Editing Apartment

- User can edit apartment name and address
- Changes are saved immediately upon confirmation
- Editing does not affect existing payments

REQ-FLAT-004: Deleting Apartment

- User can delete apartment
- Deleting apartment automatically deletes all associated PaymentTypes and Payments (cascade delete)
- No deletion confirmation in MVP

REQ-FLAT-005: Apartment Details

- Details view shows: name, address, list of payment types, list of generated payments
- From details level, available actions: edit, delete, add payment types, generate payments

### 3.3. Payment Type Management

REQ-PTYPE-001: Adding Payment Type

- User can add payment type to apartment
- Required fields: name (string), base_amount (decimal >= 0)
- Payment type is template for generating monthly instances
- Base amount must be non-negative (check constraint)

REQ-PTYPE-002: Displaying Payment Types

- Payment type list is visible on apartment details page
- For each type shown: name, base amount
- All payment types are always active (no active/inactive status)

REQ-PTYPE-003: Payment Type Deletion Restriction

- No ability to delete payment types in MVP
- Apartment must have minimum 1 PaymentType (business validation)

### 3.4. Payment Generation and Management

REQ-PAY-001: Monthly Payment Generation

- User clicks "Generate payments" button on apartment page
- System presents form for selecting month (1-12) and year (integer)
- After confirmation, system creates Payment for all active PaymentTypes of that apartment
- Payment amount is copied from PaymentType's base_amount at generation time
- Default status of new payment: is_paid = false

REQ-PAY-002: Payment Uniqueness

- Database constraint: unique(payment_type_id, month, year)
- Attempt to generate duplicate returns database error
- No duplicate checking in UI (MVP simplification)

REQ-PAY-003: Displaying Payment List

- User sees list of generated payments on apartment page
- For each payment shown: type name, amount, month/year, payment status
- By default, all unpaid payments are displayed (without time filter)
- Paid payments are visually distinguished from unpaid

REQ-PAY-004: Marking Payment as Paid

- User can mark unpaid payment as paid
- System sets is_paid = true and paid_at = current timestamp
- Status change is immediate and visible on list
- Dashboard debt updates automatically

REQ-PAY-005: Paid Payment Edit Restriction

- Payment with is_paid = true cannot be edited
- UI hides/disables edit button for paid payments
- Edit attempt displays message: "Cannot edit paid payment"
- No ability to change status from paid to unpaid in MVP

REQ-PAY-007: Editing Unpaid Payment

- No editing of unpaid payment in MVP
- No ability to delete payment in MVP

REQ-PAY-008: Monthly Payment Generation on main page

- User clicks "Generate payments for current month" button on main bar
- System automatically have selected current month and year
- After confirmation, system creates Payment for all active PaymentTypes for all apartments
- Payment amount is copied from PaymentType's base_amount at generation time
- Default status of new payment: is_paid = false

### 3.5. Dashboard and Reporting

REQ-DASH-001: Default View

- Dashboard is the first view after login
- User is automatically redirected to dashboard after login

REQ-DASH-002: Apartment List with Debt

- Dashboard displays list of all user's apartments
- Debt (sum of unpaid payments) is shown for each apartment
- Debt = sum of amount where is_paid = false for given apartment
- Debt is displayed in PLN

REQ-DASH-003: Metrics Independence from Filter

- Dashboard metrics (debt per apartment) are calculated independently of time filter
- Debt always shows sum of all unpaid payments regardless of month

REQ-DASH-004: Payment Filtering by Time

- User can filter payment view by month and year
- Filter applies only to payment list, does not affect dashboard metrics
- By default, all unpaid payments are shown (without time restriction)
- Filter can be reset to default view

REQ-DASH-005: Quick Access to Details

- From dashboard, user can click on apartment to go to details
- Dashboard provides quick overview of key information without diving into details

### 3.6. Validation and Error Handling

REQ-VAL-001: Form Validation

- All required fields must be filled
- Amounts (base_amount, amount) must be >= 0
- Month must be in range 1-12
- Year must be an integer
- Payment date can be in the future (no restriction)

REQ-VAL-002: Error Messages

- Validation errors display understandable messages
- Examples: "Amount cannot be negative", "Required field", "Month must be from 1 to 12"
- Database errors (e.g., unique constraint) are presented in user-friendly form

REQ-VAL-003: Success Messages

- After successful action execution, confirmation message is displayed
- Examples: "Apartment added", "Payment marked as paid", "Payments generated"

### 3.7. Non-functional Requirements

REQ-UX-001: User Interface

- Interface is responsive only for desktop (min-width: 1024px)
- No support for small screens (mobile) in MVP
- Layout optimized for desktop resolutions

REQ-UX-002: Intuitiveness

- Payment generation process is intuitive (button with month selection)
- Forms are simple and contain only essential fields
- Dashboard is readable and provides quick access to information

REQ-COMPAT-001: Browser Compatibility

- Application works in Chrome, Firefox, Safari, Edge (last 2 versions)
- Support only for desktop browser versions

REQ-SEC-001: Data Security

- Passwords are hashed before saving
- Row Level Security protects data between users
- No possibility to access other users' data through API or UI

## 4. Product Boundaries

### 4.1. Features Outside MVP Scope

User Management:

- User profile management
- Multi-level user roles

Advanced Payment Management:

- Different payment forms (cash, transfer, card)
- Overpayments and their settlement
- Partial payments
- Payment change history
- Payment notes
- Attachments (payment receipts)

Advanced Payment Type Management:

- Deactivation of payment types
- Deletion of payment types
- Base amount change history
- Payment type expiration dates
- Payment seasonality
- Automatic indexation

Automation:

- Automatic monthly payment generation
- Payment deadline notifications
- Arrears reminders
- Automatic statement sending to tenants

Reporting and Export:

- PDF data export
- Excel data export
- Annual reports
- Payment trend analytics
- Charts and visualizations

Tenant Management:

- Tenant database
- Assigning tenants to apartments
- Tenant history
- Contact details
- Lease agreements

Collaboration:

- Shared access to apartments
- Different permission levels
- User action logging
- Shared comments and notes

Integrations:

- Bank integrations
- Automatic payment import
- Accounting system integration
- API for external systems

Multi-platform:

- Mobile application (iOS, Android)
- Responsiveness for small screens
- Offline mode
- Cross-device synchronization

Advanced UX Features:

- Deletion confirmations
- Undo operations
- Bulk operations (generation for multiple apartments)
- Drag and drop
- Advanced filtering and sorting

Multi-currency:

- Support for different currencies
- Currency rate conversion
- Currency rate history

### 4.2. MVP Technical Simplifications

Validation:

- No advanced business validation
- Minimal form validation (only basic rules)
- No duplicate checking in UI (only database constraint)
- No limits on number of apartments/payment types/payments

UX:

- No deletion confirmations
- No undo operations
- Basic success/error messages
- Minimalist design

Security:

- No two-factor authentication
- No password strength control
- No login attempt limits
- No multi-device sessions

Performance:

- No pagination (assuming small number of records)
- No caching
- No query optimization (relying on simple queries)

### 4.3. Business Assumptions

- Application serves landlords with 2-10 apartments (does not scale to hundreds of properties)
- One landlord = one user (no delegated access)
- All payments are monthly recurring (no one-time payments)
- All amounts in PLN (no multi-currency)
- Apartments are rented long-term (no short-term rentals)
- Landlord personally manages apartments (no property managers)

### 4.4. Technical Limitations

- Desktop only (min-width: 1024px)
- Last 2 versions of desktop browsers
- No offline mode
- No Progressive Web App
- No support for older browsers (IE11)

## 5. User Stories

### 5.1. Authentication and Security

US-001: System Login
As a landlord I want to log into the system using email and password, to access my data

Acceptance criteria:

- Login form contains fields: email, password
- After entering correct credentials, user is logged in
- After login, user is redirected to dashboard
- User session is maintained until logout
- Incorrect credentials display error message
- Password is hidden during input (type="password")

US-002: System Logout
As a logged-in user I want to log out of the system, to end my session

Acceptance criteria:

- "Logout" button/link is visible in every application view
- After clicking "Logout", user session is ended
- After logout, user is redirected to login page
- Access attempt to protected pages after logout redirects to login

US-003: User Data Protection
As a system user I want to be sure I see only my data, so my privacy is protected

Acceptance criteria:

- User sees only their own apartments on the list
- User sees only payment types assigned to their own apartments
- User sees only payments related to their own apartments
- Attempt to access another user's apartment returns error 403/404
- Row Level Security is configured for tables: Flat, PaymentType, Payment
- No possibility to bypass security through API

US-004: Application Access with Test Credentials
As a new system user I want to log in using credentials from documentation, to test the application

Acceptance criteria:

- README.md contains credentials of two test users
- User 1 (admin@flatmanager.local / password123) has 3 apartments with payments
- User 2 (test@flatmanager.local / password123) has no apartments
- Login is possible with both accounts
- Test data is automatically created during database initialization

### 5.2. Apartment Management

US-005: Adding New Apartment
As a landlord I want to add new apartment by providing name and address, to track its payments

Acceptance criteria:

- Add form contains fields: name (required), address (required)
- Validation requires both fields to be filled
- After saving, apartment appears on dashboard list
- After saving, user is redirected to apartment details
- Success message confirms apartment addition
- New apartment has debt = 0 PLN

US-006: Browsing My Apartment List
As a landlord I want to see list of all my apartments on dashboard, to have overview of my portfolio

Acceptance criteria:

- Dashboard displays all user's apartments
- For each apartment shown: name, address, debt
- List is sorted alphabetically by name
- Empty list (no apartments) displays message "No apartments"
- Each apartment is a clickable link to details
- Dashboard is first view after login

US-007: Editing Apartment Data
As a landlord I want to edit apartment name and address, to update information

Acceptance criteria:

- Edit form is available from apartment details page
- Form is pre-filled with current values
- Name and address editing is possible
- Validation requires both fields to be filled
- After saving, changes are immediately visible
- Editing does not affect existing payment types and payments
- Success message confirms saving changes

US-008: Deleting Apartment
As a landlord I want to delete apartment I no longer rent, to keep system organized

Acceptance criteria:

- "Delete" button is available on apartment details page
- Deleting apartment removes all associated payment types and payments (cascade)
- After deletion, apartment disappears from dashboard list
- User is redirected to dashboard after deletion
- Success message confirms deletion
- No deletion confirmation in MVP (simplification)

US-009: Displaying Apartment Details
As a landlord I want to see apartment details, to access full information and actions

Acceptance criteria:

- Details page shows: name, apartment address
- Payment types list for apartment is visible
- Generated payments list is visible
- Available actions: edit apartment, delete, add payment type, generate payments
- Debt for apartment is displayed
- Return to dashboard is possible

### 5.3. Payment Type Management

US-010: Adding Payment Type to Apartment
As a landlord I want to add payment type to apartment (e.g., "Rent 1000 PLN"), to define recurring costs

Acceptance criteria:

- Add form is available from apartment details page
- Required fields: payment type name, base amount
- Base amount must be >= 0 (validation)
- After saving, payment type appears on types list for apartment
- Payment type is template for future generations
- Success message confirms addition
- Multiple payment types can be added to one apartment

US-011: Browsing Payment Types for Apartment
As a landlord I want to see list of payment types for apartment, to know which payments are defined

Acceptance criteria:

- Payment types list is visible on apartment details page
- For each type shown: name, base amount
- All payment types are active (no inactive status)
- If apartment has no payment types, message is displayed
- List is ordered by creation date (newest on top)

US-012: Editing Payment Type Base Amount
As a landlord I want to edit payment type name and base amount, to update payment parameters

Acceptance criteria:

- Edit form is available for each payment type
- Name and base amount editing is possible
- Base amount must be >= 0 (validation)
- Changing base_amount affects only future generations
- Already generated payments (Payment) are not updated
- After saving, changes are immediately visible
- Success message confirms saving

US-013: Protection Against Last Payment Type Deletion
As a landlord I cannot delete the last payment type from apartment, so apartment always has minimum one payment

Acceptance criteria:

- No ability to delete payment types in MVP
- Apartment must have minimum 1 PaymentType (business rule)
- Validation prevents deletion of last type

US-014: No Payment Type Deactivation in MVP
As a landlord all my payment types are always active, because MVP does not support deactivation

Acceptance criteria:

- All PaymentTypes are always active
- No status field (active/inactive) in database and UI
- During generation, all payment types assigned to apartment are taken
- No ability to filter by status

### 5.4. Generowanie i zarządzanie opłatami

US-015: Generowanie miesięcznych opłat jednym kliknięciem
Jako właściciel chcę wygenerować wszystkie opłaty dla mieszkania na dany miesiąc jednym kliknięciem, aby zaoszczędzić czas

Kryteria akceptacji:

- Przycisk "Generuj opłaty" jest dostępny na stronie szczegółów mieszkania
- Formularz wyboru zawiera: miesiąc (1-12), rok (liczba całkowita)
- Po zatwierdzeniu system tworzy Payment dla każdego PaymentType mieszkania
- Kwota Payment jest kopiowana z base_amount w momencie generowania
- Wszystkie wygenerowane opłaty mają domyślnie is_paid = false
- Po generowaniu opłaty są widoczne na liście
- Komunikat sukcesu pokazuje liczbę wygenerowanych opłat

US-016: Zapobieganie duplikatom opłat
Jako właściciel nie mogę wygenerować ponownie opłaty dla tego samego typu i miesiąca, aby uniknąć duplikatów

Kryteria akceptacji:

- Constraint w bazie: unique(payment_type_id, month, year)
- Próba wygenerowania duplikatu zwraca błąd z bazy danych
- Komunikat błędu informuje o istnieniu opłaty dla danego miesiąca
- Brak sprawdzania duplikatów w UI przed wysłaniem (uproszczenie MVP)
- Częściowe generowanie: jeśli jeden typ ma duplikat, reszta jest generowana

US-017: Przeglądanie wygenerowanych opłat
Jako właściciel chcę zobaczyć listę wygenerowanych opłat dla mieszkania, aby wiedzieć co jest do zapłacenia

Kryteria akceptacji:

- Lista opłat jest widoczna na stronie szczegółów mieszkania
- Dla każdej opłaty pokazane są: nazwa typu, kwota, miesiąc/rok, status (opłacona/nieopłacona)
- Domyślnie wyświetlane są wszystkie nieopłacone opłaty
- Opłaty opłacone są wizualnie odróżnione (np. przekreślone, szare, zielony badge)
- Lista jest sortowana po dacie (miesiąc/rok) malejąco

US-018: Oznaczanie opłaty jako opłaconej
Jako właściciel chcę oznaczyć nieopłaconą opłatę jako opłaconą, aby śledzić stan płatności

Kryteria akceptacji:

- Przycisk/checkbox "Oznacz jako opłacona" jest dostępny dla nieopłaconych opłat
- Po kliknięciu system ustawia is_paid = true i paid_at = current timestamp
- Zmiana statusu jest natychmiastowa i widoczna na liście
- Zadłużenie na dashboardzie aktualizuje się automatycznie
- Komunikat sukcesu potwierdza zmianę statusu
- Opłata jest wizualnie oznaczona jako opłacona

US-019: Ochrona przed edycją opłaconej opłaty
Jako właściciel nie mogę edytować opłaty która została już opłacona, aby zachować integralność danych finansowych

Kryteria akceptacji:

- Przycisk edycji jest ukryty/zablokowany dla opłat z is_paid = true
- Próba edycji opłaconej opłaty wyświetla komunikat: "Nie można edytować opłaconej opłaty"
- Brak możliwości zmiany kwoty opłaconej opłaty przez UI
- Brak możliwości zmiany statusu z opłacona na nieopłacona w MVP

### 5.5. Dashboard i raportowanie

US-022: Dashboard jako domyślny widok po zalogowaniu
Jako właściciel chcę zobaczyć dashboard zaraz po zalogowaniu, aby natychmiast mieć przegląd sytuacji

Kryteria akceptacji:

- Po zalogowaniu użytkownik jest automatycznie przekierowany na dashboard
- Dashboard jest domyślną stroną główną aplikacji
- Możliwy jest powrót do dashboardu z każdej strony (link w nawigacji)

US-023: Przegląd zadłużenia wszystkich mieszkań
Jako właściciel chcę zobaczyć zadłużenie per mieszkanie na dashboardzie, aby szybko zidentyfikować problematyczne lokale

Kryteria akceptacji:

- Dashboard wyświetla listę mieszkań z zadłużeniem
- Zadłużenie = suma kwot (amount) gdzie is_paid = false dla danego mieszkania
- Zadłużenie jest wyświetlane w formacie: "1 234.56 PLN"
- Mieszkanie bez zadłużenia pokazuje "0.00 PLN"
- Zadłużenie jest obliczane dynamicznie przy każdym ładowaniu
- Mieszkania z największym zadłużeniem można łatwo zidentyfikować

US-024: Niezależność metryk od filtra czasowego
Jako właściciel chcę aby zadłużenie na dashboardzie pokazywało całkowitą sumę nieopłaconych opłat niezależnie od wybranego filtru, aby mieć pełny obraz sytuacji

Kryteria akceptacji:

- Zadłużenie na dashboardzie nie zmienia się po zastosowaniu filtru czasowego
- Zadłużenie zawsze oblicza sumę wszystkich nieopłaconych opłat (bez ograniczenia czasowego)
- Filtr po miesiącu/roku wpływa tylko na widok listy opłat
- Metryki dashboardu są całkowicie niezależne od filtrów

US-025: Filtrowanie opłat po miesiącu i roku
Jako właściciel chcę filtrować opłaty po miesiącu i roku, aby analizować konkretny okres

Kryteria akceptacji:

- Formularz filtra zawiera: miesiąc (1-12), rok (liczba całkowita)
- Po zastosowaniu filtru wyświetlane są tylko opłaty z wybranego miesiąca/roku
- Możliwe jest resetowanie filtru do widoku domyślnego (wszystkie nieopłacone)
- Filtr dotyczy tylko widoku opłat, nie wpływa na zadłużenie
- Filtr jest zachowywany podczas nawigacji w ramach mieszkania
- Stan filtru jest widoczny dla użytkownika

US-026: Domyślny widok wszystkich nieopłaconych opłat
Jako właściciel chcę aby domyślnie wyświetlane były wszystkie nieopłacone opłaty bez ograniczenia czasowego, aby widzieć pełny obraz zaległości

Kryteria akceptacji:

- Po wejściu na stronę mieszkania wyświetlane są wszystkie opłaty z is_paid = false
- Brak domyślnego filtru czasowego
- Użytkownik widzi wszystkie zaległości niezależnie od miesiąca
- Możliwe jest zastosowanie filtru aby zawęzić widok do konkretnego okresu

US-027: Szybki dostęp do szczegółów mieszkania z dashboardu
Jako właściciel chcę kliknąć w mieszkanie na dashboardzie, aby szybko przejść do szczegółów i akcji

Kryteria akceptacji:

- Każde mieszkanie na liście jest klikalnym linkiem
- Kliknięcie przenosi do strony szczegółów mieszkania
- Z poziomu szczegółów możliwy jest powrót do dashboardu
- Nawigacja jest intuicyjna i spójna w całej aplikacji

### 5.6. Walidacja i obsługa błędów

US-028: Walidacja formularzy przed zapisem
Jako użytkownik chcę aby system walidował dane przed zapisem, aby uniknąć błędów

Kryteria akceptacji:

- Wszystkie pola wymagane muszą być wypełnione (walidacja)
- Kwoty (base_amount, amount) muszą być >= 0 (check constraint + walidacja UI)
- Miesiąc musi być w zakresie 1-12 (walidacja)
- Rok musi być liczbą całkowitą (walidacja)
- Data płatności może być w przyszłości (brak ograniczenia)
- Błędy walidacji są wyświetlane przy odpowiednich polach
- Formularz nie jest wysyłany jeśli walidacja nie przeszła

US-029: Zrozumiałe komunikaty błędów
Jako użytkownik chcę otrzymywać zrozumiałe komunikaty błędów, aby wiedzieć co poszło nie tak

Kryteria akceptacji:

- Komunikaty błędów są w języku polskim
- Przykłady: "Kwota nie może być ujemna", "Pole wymagane", "Miesiąc musi być od 1 do 12"
- Błędy z bazy danych są tłumaczone na przyjazne komunikaty
- Duplikat opłaty: "Opłata dla tego typu już istnieje w wybranym miesiącu"
- Constraint violation: komunikat wyjaśnia co jest nie tak
- Komunikaty są wyświetlane w widocznym miejscu

US-030: Potwierdzenia pomyślnych akcji
Jako użytkownik chcę otrzymywać potwierdzenia że akcja się powiodła, aby mieć pewność

Kryteria akceptacji:

- Po pomyślnej akcji wyświetlany jest komunikat sukcesu
- Przykłady: "Mieszkanie dodane", "Opłata oznaczona jako opłacona", "Opłaty wygenerowane dla miesiąca X"
- Komunikaty sukcesu są wizualnie odróżnione od błędów (np. kolor zielony)
- Komunikat znika automatycznie po kilku sekundach lub po akcji użytkownika

### 5.7. Seed data i inicjalizacja

US-031: Automatyczne tworzenie danych testowych
Jako deweloper/tester chcę aby system automatycznie tworzył dane testowe przy inicjalizacji, aby móc od razu przetestować funkcjonalności

Kryteria akceptacji:

- Seed script tworzy 2 użytkowników testowych
- User 1 (admin@flatmanager.local) ma 3 mieszkania
  - Mieszkanie 1: "Żoliborz 1", "ul. Słowackiego 1"
    - PaymentType: "Czynsz", 1000 PLN
    - PaymentType: "Administracja", 200 PLN
  - Mieszkanie 2: "Mokotów 2", "ul. Puławska 2"
    - PaymentType: "Czynsz", 1500 PLN
  - Mieszkanie 3: "Praga 3", "ul. Targowa 3"
    - PaymentType: "Czynsz", 800 PLN
    - PaymentType: "Media", 150 PLN
- User 2 (test@flatmanager.local) nie ma mieszkań
- Seed script jest idempotentny (można uruchomić wielokrotnie)
- Credentials są udokumentowane w README.md

### 5.8. Edge Cases and Alternative Scenarios

US-036: Handling User Without Apartments
As a new user without apartments I want to see empty dashboard with option to add apartment, to be able to start using the application

Acceptance criteria:

- Dashboard for user without apartments shows message "No apartments"
- "Add apartment" button is visible
- No errors when rendering empty list
- User 2 from seed data (test@flatmanager.local) has empty apartments list

US-037: Handling Apartment Without Payments
As a landlord of apartment without generated payments I want to see message, to know I can generate payments

Acceptance criteria:

- Apartment details page without payments shows message "No generated payments"
- "Generate payments" button is visible
- Debt for apartment = 0 PLN
- No errors when rendering empty list

US-038: Handling Apartment with Only Paid Payments
As a landlord of apartment with only paid payments I want to see debt 0 PLN, to know everything is settled

Acceptance criteria:

- Dashboard shows debt = 0 PLN for apartment without unpaid payments
- Default view (all unpaid) shows empty list
- Message informs: "All payments paid"
- Switching to view of all payments is possible (with filter)

US-039: Attempt to Generate Payments for Future Month
As a landlord I want to be able to generate payments for future month in advance, to plan payments

Acceptance criteria:

- No restriction on selecting future month/year
- System allows generating payments for any date
- Date can be in past or future (no validation in MVP)

US-040: Attempt to Edit/Delete Non-existent Record
As a user I want to receive error if I try to edit/delete record that does not exist, for system to be stable

Acceptance criteria:

- Attempt to access non-existent apartment returns 404 error
- Attempt to access non-existent payment returns 404 error
- Error message informs that resource was not found
- No application crash

US-041: Handling Database Errors
As a user I want to receive message if database error occurred, to know something went wrong

Acceptance criteria:

- Constraint violation errors are translated to friendly messages
- Database connection errors display general error message
- Application does not crash on database error
- User is informed about problem and can try again

US-042: Cascade Delete When Deleting Apartment
As a landlord I want deleting apartment to delete all related data, to avoid orphaned records

Acceptance criteria:

- Deleting Flat automatically deletes all PaymentTypes
- Deleting Flat automatically deletes all Payments
- No orphaned records in database after deletion
- Cascade delete works at database level

US-043: Validation of Negative Amounts
As a user I cannot enter negative amount, to avoid errors in data

Acceptance criteria:

- Amount field in form does not accept values < 0
- Check constraint in database prevents saving negative amount
- UI validation displays message: "Amount cannot be negative"
- Database error is translated to friendly message

US-044: Duplicate Apartment/Payment Type Names
As a user I can create apartments or payment types with same name, because MVP does not require name uniqueness

Acceptance criteria:

- No unique constraint on apartment name
- No unique constraint on payment type name
- Creating two apartments "Apartment 1" is possible
- Creating two types "Rent" for same apartment is possible
- User can organize data according to own preferences

## 6. Success Metrics

### 6.1. Product Metrics

Product Adoption:

- 2 test users actively use the application within first week
- Average 5+ apartments managed in system (total across users)
- Average 3+ payment types per apartment
- Payment generation performed minimum 1 time per week

User Engagement:

- User logs into system minimum 2 times per month
- Average session time > 5 minutes
- User marks payments as paid regularly (at least 1 time per week)

### 6.2. Functional Metrics

Functionality Completeness:

- 100% of user stories from section 5 implemented and tested
- All CRUD operations for 3 main entities (Flat, PaymentType, Payment) work correctly
- Authentication and RLS protect data between users
- Dashboard displays correct debt for all apartments

Data Quality:

- 0 orphaned records in database (thanks to cascade delete)
- 0 payment duplicates (thanks to unique constraint)
- 0 negative amounts in database (thanks to check constraint)
- 100% of payments have correct association with apartment and payment type

### 6.5. Usability Metrics

Intuitiveness:

- New user is able to add apartment and generate payments without instructions in < 5 minutes
- Payment generation process requires maximum 3 clicks
- Dashboard immediately shows key information (debt)

User Communication:

- Every CRUD action ends with success or error message
- Error messages are understandable for non-technical user
- All forms have validation with appropriate messages

### 6.6. MVP Acceptance Criteria

Functional:

- User can log in with predefined credentials (US-001, US-004)
- User sees dashboard with apartment list after login (US-006, US-022)
- User can manage minimum 1 apartment (US-005, US-007, US-008)
- Apartment has at least 1 payment type (US-010, US-013)
- User can generate payments for apartment for given month (US-015)
- User can mark unpaid payment as paid (US-018)
- User cannot edit payment already paid (US-019)
- Dashboard shows correct debt sum per apartment (US-023)
- Generated payments for same PaymentType and month are unique (US-016)
- Seed script creates 2 users: 1 with 3 apartments, 1 without apartments (US-031)

Technical:

- Application is deployed and accessible via URL
- Data is persisted in Supabase database
- Application works only on desktop (min-width: 1024px) (US-035)
- Unique constraint prevents payment duplicates (REQ-DATA-004)
- Check constraint prevents negative amounts (REQ-DATA-003, REQ-DATA-004)
- RLS policies protect data between users (US-003)
- User credentials are documented in README (US-004)

Qualitative:

- Code is written in TypeScript with basic typing
- Database has defined basic constraints (NOT NULL, foreign keys, unique, check)
- Application does not crash in basic use cases
- Payment generation process is clear for user (US-015)
- Dashboard provides quick access to key information (US-027)

### 6.7. MVP Success Definition

MVP is considered successful if:

- All 44 user stories are implemented and tested
- Application meets all functional requirements from section 3
- Application meets MVP acceptance criteria
- 2 test users can fully use the application
- User can manage 3+ apartments and their payments without problems
- System correctly calculates debt and prevents duplicates
- Code is ready for further development (good structure, typing, constraints)

MVP does NOT need to:

- Support mobile devices
- Have advanced UI/UX (functional interface is sufficient)
- Handle hundreds of apartments (optimization for 2-10 apartments)
- Have test coverage (tests can be added later)
- Be fully optimized (< 2s for dashboard is sufficient)
