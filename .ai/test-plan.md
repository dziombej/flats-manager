Jako doświadczony inżynier QA, po dogłębnej analizie dostarczonego kodu i struktury projektu, przedstawiam kompleksowy plan testów dla aplikacji "Flats Manager".

***

# Plan Testów dla Projektu "Flats Manager"

---

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie
Niniejszy dokument opisuje strategię, zakres, zasoby i harmonogram działań testowych dla aplikacji "Flats Manager". Aplikacja jest systemem webowym opartym o architekturę Astro z interaktywnymi komponentami React, przeznaczonym do zarządzania nieruchomościami na wynajem, w szczególności do śledzenia płatności i zadłużenia. Celem planu jest zapewnienie systematycznego podejścia do weryfikacji jakości oprogramowania.

### 1.2. Cele Testowania
Głównym celem procesu testowego jest zapewnienie, że aplikacja "Flats Manager" spełnia wymagania biznesowe i techniczne oraz jest niezawodna, bezpieczna i użyteczna.

**Cele szczegółowe:**
*   **Weryfikacja funkcjonalna:** Potwierdzenie, że wszystkie funkcje, od uwierzytelniania po zarządzanie płatnościami, działają zgodnie ze specyfikacją.
*   **Zapewnienie bezpieczeństwa:** Weryfikacja, że dane użytkowników są odizolowane i zabezpieczone przed nieautoryzowanym dostępem.
*   **Ocena użyteczności (UX/UI):** Zapewnienie, że interfejs użytkownika jest intuicyjny, spójny i responsywny na różnych urządzeniach.
*   **Identyfikacja i raportowanie defektów:** Wczesne wykrywanie błędów w celu minimalizacji kosztów ich naprawy.
*   **Walidacja integralności danych:** Sprawdzenie, czy operacje na danych (np. obliczanie długu, generowanie płatności) dają poprawne i spójne wyniki.
*   **Potwierdzenie gotowości do wdrożenia:** Stwierdzenie, czy aplikacja osiągnęła poziom jakości umożliwiający jej wdrożenie na środowisko produkcyjne.

---

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami
Testy obejmą wszystkie kluczowe moduły i funkcjonalności aplikacji:
*   **Moduł Uwierzytelniania i Autoryzacji:**
    *   Rejestracja nowego użytkownika.
    *   Logowanie i wylogowywanie.
    *   Ochrona tras (middleware) - dostęp do poszczególnych sekcji aplikacji w zależności od statusu zalogowania.
    *   Przekierowania dla zalogowanych i niezalogowanych użytkowników.
*   **Moduł Zarządzania Mieszkaniami (Flats):**
    *   Tworzenie nowego mieszkania (CRUD - Create).
    *   Wyświetlanie listy mieszkań (CRUD - Read).
    *   Wyświetlanie szczegółów mieszkania (CRUD - Read).
    *   Edycja danych mieszkania (CRUD - Update).
    *   Usuwanie mieszkania wraz z powiązanymi danymi (płatności, typy płatności) (CRUD - Delete).
*   **Moduł Zarządzania Typami Płatności (Payment Types):**
    *   Dodawanie typów płatności (np. czynsz, media) do konkretnego mieszkania.
    *   Edycja istniejących typów płatności.
    *   Wyświetlanie listy typów płatności w szczegółach mieszkania.
*   **Moduł Zarządzania Płatnościami (Payments):**
    *   Generowanie miesięcznych płatności na podstawie zdefiniowanych typów.
    *   Wyświetlanie listy płatności z możliwością filtrowania.
    *   Oznaczanie płatności jako "zapłacona".
    *   Automatyczne oznaczanie płatności jako "zaległa" (overdue).
*   **Pulpit (Dashboard):**
    *   Wyświetlanie statystyk ogólnych (całkowita liczba mieszkań, łączne zadłużenie).
    *   Wyświetlanie siatki mieszkań z informacją o zadłużeniu.
    *   Funkcjonalności wyszukiwania, sortowania i filtrowania na liście mieszkań.
*   **Interfejs Użytkownika (UI):**
    *   Responsywność widoków na urządzeniach mobilnych i desktopowych.
    *   Przełącznik motywu (jasny/ciemny).
    *   Obsługa stanów ładowania (skeletons) i błędów.

### 2.2. Funkcjonalności wyłączone z testów
*   Testowanie infrastruktury Supabase (wydajność bazy danych, działanie API Supabase).
*   Testowanie zewnętrznych bibliotek (np. Radix UI, clsx) poza kontekstem ich implementacji w aplikacji.
*   Testy penetracyjne i zaawansowane testy bezpieczeństwa (mogą być przedmiotem osobnego planu).

---

## 3. Typy Testów

W projekcie zostaną przeprowadzone następujące typy testów:

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania pojedynczych komponentów React, funkcji pomocniczych (utils) i transformerów danych w izolacji.
    *   **Zakres:** Logika walidacji w formularzach, funkcje formatujące (`formatCurrency`), transformery danych (`transformFlatDetailData`), logika komponentów UI.
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Sprawdzenie poprawności współpracy pomiędzy różnymi częściami systemu.
    *   **Zakres:**
        *   Testowanie warstwy serwisowej (`FlatsService`, `AuthService`) z zamockowanym klientem Supabase w celu weryfikacji logiki biznesowej.
        *   Testowanie endpointów API w celu sprawdzenia walidacji, obsługi błędów i poprawnej komunikacji z warstwą serwisową.
*   **Testy End-to-End (E2E):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użycia aplikacji z perspektywy użytkownika końcowego, weryfikując cały przepływ danych od interfejsu po bazę danych.
    *   **Zakres:** Pełne ścieżki użytkownika, np. "rejestracja -> logowanie -> dodanie mieszkania -> dodanie typu płatności -> wygenerowanie płatności -> sprawdzenie długu na pulpicie -> opłacenie płatności -> wylogowanie".
*   **Testy Bezpieczeństwa (Security Tests):**
    *   **Cel:** Weryfikacja kluczowych aspektów bezpieczeństwa, zwłaszcza izolacji danych.
    *   **Zakres:** Testy E2E sprawdzające, czy użytkownik A nie ma dostępu (do odczytu, modyfikacji, usunięcia) do zasobów (mieszkań, płatności) użytkownika B.
*   **Testy Manualne i Eksploracyjne:**
    *   **Cel:** Weryfikacja użyteczności (UX), spójności wizualnej (UI) oraz odkrywanie nieprzewidzianych błędów.
    *   **Zakres:** Responsywność, działanie na różnych przeglądarkach, ogólna intuicyjność interfejsu.
*   **Testy Regresji:**
    *   **Cel:** Zapewnienie, że nowe zmiany nie zepsuły istniejących funkcjonalności.
    *   **Zakres:** Uruchamianie zautomatyzowanego zestawu testów (E2E i integracyjnych) po każdej większej zmianie w kodzie oraz przed każdym wdrożeniem.

---

## 4. Scenariusze Testowe (Przykładowe)

Poniżej przedstawiono kluczowe scenariusze testowe o wysokim priorytecie.

| Moduł | ID Scenariusza | Opis | Priorytet |
| :--- | :--- | :--- | :--- |
| **Uwierzytelnianie** | AUTH-01 | Użytkownik może pomyślnie zarejestrować konto, używając poprawnego emaila i hasła. | Krytyczny |
| | AUTH-02 | Użytkownik może zalogować się na istniejące konto i zostać przekierowany na pulpit. | Krytyczny |
| | AUTH-03 | Niezalogowany użytkownik, próbując wejść na `/dashboard`, jest przekierowywany na stronę logowania. | Krytyczny |
| | AUTH-04 | System wyświetla czytelny komunikat błędu przy próbie logowania z niepoprawnymi danymi. | Wysoki |
| **Izolacja Danych** | SEC-01 | Zalogowany użytkownik A, znając ID mieszkania użytkownika B, nie może wyświetlić jego szczegółów (ani przez UI, ani przez bezpośrednie zapytanie API). | Krytyczny |
| | SEC-02 | Zalogowany użytkownik A nie może modyfikować ani usuwać danych należących do użytkownika B. | Krytyczny |
| **Zarządzanie Mieszkaniami** | FLAT-01 | Użytkownik może utworzyć nowe mieszkanie, podając poprawną nazwę i adres. | Krytyczny |
| | FLAT-02 | Użytkownik może edytować dane istniejącego mieszkania. | Wysoki |
| | FLAT-03 | Użytkownik może usunąć mieszkanie, co powoduje usunięcie wszystkich powiązanych z nim typów płatności i płatności. | Wysoki |
| **Płatności** | PAY-01 | Użytkownik może dodać nowy typ płatności (np. "Czynsz", 2000 PLN) do mieszkania. | Krytyczny |
| | PAY-02 | System poprawnie generuje płatności na wybrany miesiąc i rok dla wszystkich zdefiniowanych typów płatności. | Krytyczny |
| | PAY-03 | Kwota zadłużenia na pulpicie i w szczegółach mieszkania jest poprawnie obliczana jako suma wszystkich nieopłaconych płatności. | Krytyczny |
| | PAY-04 | Użytkownik może oznaczyć płatność jako "zapłaconą", co aktualizuje jej status i kwotę długu. | Wysoki |
| **Pulpit** | DASH-01 | Filtry (wg statusu zadłużenia) i sortowanie (np. wg długu malejąco) na liście mieszkań działają poprawnie. | Średni |

---

## 5. Środowisko Testowe

*   **Środowisko deweloperskie (lokalne):** Używane przez deweloperów do uruchamiania testów jednostkowych i integracyjnych.
*   **Środowisko Staging:** Sklonowana infrastruktura produkcyjna z osobną instancją bazy danych Supabase. Środowisko to będzie używane do przeprowadzania testów E2E, manualnych i regresji. Baza danych na tym środowisku będzie regularnie czyszczona i wypełniana zdefiniowanym zestawem danych testowych (test data seed).
*   **Przeglądarki:** Testy będą wykonywane na najnowszych wersjach przeglądarek:
    *   Google Chrome
    *   Mozilla Firefox
    *   Safari

---

## 6. Narzędzia do Testowania

*   **Framework do testów jednostkowych i integracyjnych:** **Vitest** z **React Testing Library** do testowania komponentów React.
*   **Framework do testów E2E:** **Playwright** lub **Cypress** do automatyzacji scenariuszy w przeglądarce.
*   **Mockowanie API/Bazy Danych:** **`supabase-mock`** lub własne mocki do testowania warstwy serwisowej w izolacji.
*   **CI/CD:** **GitHub Actions** do automatycznego uruchamiania zestawów testów (jednostkowych, integracyjnych, E2E) po każdym pushu do gałęzi `main` oraz przy tworzeniu Pull Requestów.
*   **Zarządzanie Testami i Błędami:** **Jira** / **Asana** / **GitHub Issues** do tworzenia i śledzenia scenariuszy testowych oraz raportowania i zarządzania cyklem życia błędów.

---

## 7. Harmonogram Testów

Proces testowy będzie prowadzony równolegle z procesem deweloperskim w ramach sprintów.

| Faza | Działania | Czas Trwania |
| :--- | :--- | :--- |
| **W trakcie sprintu** | Testowanie jednostkowe i integracyjne nowych funkcjonalności (przez deweloperów).<br>Tworzenie i aktualizacja testów E2E (przez QA).<br>Testy eksploracyjne nowych funkcjonalności (przez QA). | Ciągły |
| **Przed wdrożeniem (Code Freeze)** | Pełna regresja zautomatyzowana (E2E).<br>Kluczowe testy manualne (Smoke Tests).<br>Weryfikacja poprawionych błędów. | 1-2 dni |
| **Po wdrożeniu** | Testy weryfikacyjne na środowisku produkcyjnym (Sanity Tests). | 2-4 godziny |

---

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria wejścia
*   Dostępna jest stabilna wersja aplikacji na środowisku Staging.
*   Wszystkie nowe funkcjonalności zostały zaimplementowane i przeszły testy jednostkowe.
*   Dostępna jest dokumentacja techniczna lub opis wymagań dla testowanych funkcjonalności.

### 8.2. Kryteria wyjścia (Definition of Done)
*   **100%** wykonanych i zakończonych sukcesem scenariuszy testowych o priorytecie **Krytycznym**.
*   **95%** wykonanych i zakończonych sukcesem scenariuszy testowych o priorytecie **Wysokim**.
*   Brak znanych błędów o priorytecie **Krytycznym** i **Wysokim**.
*   Wszystkie znalezione błędy są zaraportowane i ocenione przez zespół.
*   Zautomatyzowane testy regresji kończą się sukcesem.

---

## 9. Role i Odpowiedzialności

| Rola | Odpowiedzialności |
| :--- | :--- |
| **Inżynier QA** | Tworzenie i utrzymanie planu testów, projektowanie i implementacja testów automatycznych (integracyjnych, E2E), przeprowadzanie testów manualnych i eksploracyjnych, raportowanie i zarządzanie błędami, koordynacja procesu UAT. |
| **Deweloperzy** | Pisanie testów jednostkowych dla swojego kodu, poprawianie zgłoszonych błędów, wsparcie w analizie przyczyn błędów, dbanie o utrzymanie działania testów w CI/CD. |
| **Product Owner / Manager** | Definiowanie kryteriów akceptacji dla funkcjonalności, udział w testach akceptacyjnych użytkownika (UAT), priorytetyzacja naprawy błędów. |

---

## 10. Procedury Raportowania Błędów

Każdy zidentyfikowany błąd musi zostać zaraportowany w systemie do śledzenia błędów (np. Jira) i powinien zawierać następujące informacje:

*   **Tytuł:** Zwięzły i jednoznaczny opis problemu.
*   **Środowisko:** Gdzie błąd wystąpił (np. Staging, Chrome v1xx).
*   **Wersja aplikacji/Commit:** Identyfikator testowanej wersji.
*   **Priorytet/Waga (Severity/Priority):**
    *   **Krytyczny:** Blokuje działanie kluczowych funkcji, powoduje utratę danych.
    *   **Wysoki:** Znacząco utrudnia korzystanie z ważnej funkcji, ale istnieje obejście.
    *   **Średni:** Błąd w działaniu funkcji drugorzędnej lub problem UI/UX.
    *   **Niski:** Drobny błąd wizualny, literówka.
*   **Kroki do odtworzenia:** Numerowana lista kroków pozwalająca jednoznacznie odtworzyć błąd.
*   **Rezultat oczekiwany:** Jak system powinien się zachować.
*   **Rezultat aktualny:** Jak system faktycznie się zachował.
*   **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli.