# Page Object Model (POM) - Dokumentacja

## Przegląd

Katalog `e2e/page-objects` zawiera klasy Page Object Model, które enkapsulują interakcje z kluczowymi elementami aplikacji Flats Manager. Każda klasa reprezentuje konkretny widok lub komponent aplikacji.

## Struktura

```
e2e/page-objects/
├── index.ts                        # Barrel export
├── header-navigation.page.ts       # Nawigacja w nagłówku
├── flat-form.page.ts              # Formularz mieszkania
├── flat-detail.page.ts            # Szczegóły mieszkania
└── dashboard.page.ts              # Dashboard
```

## Klasy POM

### 1. HeaderNavigationPage

**Plik:** `header-navigation.page.ts`

Enkapsuluje interakcje z głównym nagłówkiem nawigacyjnym.

**Locatory:**

- `addFlatButton` - Przycisk "+ Add Flat"
- `dashboardLink` - Link do dashboardu
- `allFlatsLink` - Link do listy wszystkich mieszkań

**Metody:**

- `goToAddFlat()` - Przejdź do formularza tworzenia mieszkania
- `goToDashboard()` - Przejdź do dashboardu
- `goToAllFlats()` - Przejdź do listy mieszkań
- `isAddFlatButtonVisible()` - Sprawdź widoczność przycisku Add Flat

**Przykład użycia:**

```typescript
const headerNav = new HeaderNavigationPage(page);
await headerNav.goToAddFlat();
```

### 2. FlatFormPage

**Plik:** `flat-form.page.ts`

Enkapsuluje interakcje z formularzem tworzenia/edycji mieszkania.

**Locatory:**

- `form` - Element formularza
- `nameInput` - Pole Name
- `addressInput` - Pole Address
- `submitButton` - Przycisk Submit
- `cancelButton` - Przycisk Cancel
- `nameError`, `addressError`, `formError` - Komunikaty błędów
- `successMessage` - Komunikat sukcesu

**Metody:**

- `gotoCreate()` - Przejdź do strony tworzenia
- `gotoEdit(flatId)` - Przejdź do strony edycji
- `fillForm(name, address)` - Wypełnij formularz
- `submit()` - Wyślij formularz
- `createFlat(name, address)` - Utwórz mieszkanie (wypełnij + wyślij)
- `updateFlat(name, address)` - Zaktualizuj mieszkanie (wypełnij + wyślij)
- `cancel()` - Anuluj formularz
- `isFormVisible()` - Sprawdź widoczność formularza
- `isSubmitDisabled()` - Sprawdź czy przycisk submit jest wyłączony
- `hasNameError()`, `hasAddressError()`, `hasFormError()` - Sprawdź błędy
- `hasSuccessMessage()` - Sprawdź komunikat sukcesu
- `getFormErrorText()` - Pobierz tekst błędu formularza
- `waitForRedirect(url)` - Poczekaj na przekierowanie

**Przykład użycia:**

```typescript
const flatForm = new FlatFormPage(page);
await flatForm.gotoCreate();
await flatForm.createFlat("Mieszkanie 1", "ul. Testowa 1");
```

### 3. FlatDetailPage

**Plik:** `flat-detail.page.ts`

Enkapsuluje interakcje ze stroną szczegółów mieszkania.

**Locatory:**

- `header` - Nagłówek strony
- `name` - Nazwa mieszkania
- `address` - Adres mieszkania
- `editButton` - Przycisk Edit
- `deleteButton` - Przycisk Delete
- `totalDebtCard` - Karta Total Debt
- `paymentTypesCountCard` - Karta Payment Types Count
- `pendingPaymentsCountCard` - Karta Pending Payments Count
- `deleteDialog` - Dialog potwierdzenia usunięcia
- `deleteConfirmButton`, `deleteCancelButton` - Przyciski w dialogu

**Metody:**

- `goto(flatId)` - Przejdź do strony szczegółów
- `getName()`, `getAddress()` - Pobierz nazwę/adres
- `getTotalDebt()` - Pobierz całkowite zadłużenie
- `getPaymentTypesCount()` - Pobierz liczbę typów płatności
- `getPendingPaymentsCount()` - Pobierz liczbę oczekujących płatności
- `clickEdit()` - Kliknij Edit
- `clickDelete()` - Kliknij Delete
- `confirmDelete()` - Potwierdź usunięcie
- `cancelDelete()` - Anuluj usunięcie
- `isHeaderVisible()` - Sprawdź widoczność nagłówka
- `isDeleteDialogVisible()` - Sprawdź widoczność dialogu usuwania
- `verifyFlatDetails(name, address)` - Zweryfikuj szczegóły mieszkania

**Przykład użycia:**

```typescript
const flatDetail = new FlatDetailPage(page);
await flatDetail.goto(flatId);
await expect(flatDetail.name).toHaveText("Mieszkanie 1");
await flatDetail.clickEdit();
```

### 4. DashboardPage

**Plik:** `dashboard.page.ts`

Enkapsuluje interakcje z dashboardem.

**Locatory (dynamiczne):**

- `getFlatCard(flatId)` - Karta mieszkania
- `getFlatCardName(flatId)` - Nazwa na karcie
- `getFlatCardAddress(flatId)` - Adres na karcie
- `getFlatCardStatus(flatId)` - Status na karcie
- `getFlatCardTotalDebt(flatId)` - Zadłużenie na karcie
- `getAllFlatCards()` - Wszystkie karty

**Metody:**

- `goto()` - Przejdź do dashboardu
- `getFlatCard(flatId)` - Pobierz locator karty mieszkania
- `hasFlatCard(flatId)` - Sprawdź czy karta istnieje
- `getFlatCardNameText(flatId)` - Pobierz tekst nazwy
- `getFlatCardAddressText(flatId)` - Pobierz tekst adresu
- `getFlatCardStatusText(flatId)` - Pobierz tekst statusu
- `getFlatCardTotalDebtText(flatId)` - Pobierz tekst zadłużenia
- `clickFlatCard(flatId)` - Kliknij kartę mieszkania
- `getFlatCardsCount()` - Pobierz liczbę kart
- `waitForLoad()` - Poczekaj na załadowanie
- `verifyFlatCard(flatId, name, status, debt)` - Zweryfikuj kartę
- `findFlatCardIdByName(name)` - Znajdź ID karty po nazwie

**Przykład użycia:**

```typescript
const dashboard = new DashboardPage(page);
await dashboard.goto();
const flatId = await dashboard.findFlatCardIdByName("Mieszkanie 1");
await expect(dashboard.getFlatCardStatus(flatId!)).toHaveText("Paid");
```

## Wzorce użycia

### Arrange-Act-Assert (AAA)

Wszystkie testy powinny stosować wzorzec AAA:

```typescript
test("should create flat", async ({ page }) => {
  // Arrange - Przygotuj obiekty POM i dane testowe
  const flatForm = new FlatFormPage(page);
  const testName = "Test Flat";
  const testAddress = "Test Address";

  // Act - Wykonaj akcje
  await flatForm.gotoCreate();
  await flatForm.createFlat(testName, testAddress);

  // Assert - Sprawdź wyniki
  await expect(page).toHaveURL(/\/flats\/[a-f0-9-]+$/);
});
```

### Kompozycja POM

Łącz różne obiekty POM w jednym teście:

```typescript
test("complete flow", async ({ page }) => {
  const headerNav = new HeaderNavigationPage(page);
  const flatForm = new FlatFormPage(page);
  const flatDetail = new FlatDetailPage(page);
  const dashboard = new DashboardPage(page);

  await dashboard.goto();
  await headerNav.goToAddFlat();
  await flatForm.createFlat("Name", "Address");
  await headerNav.goToDashboard();

  const flatId = await dashboard.findFlatCardIdByName("Name");
  await dashboard.clickFlatCard(flatId!);
});
```

### Metody pomocnicze

POM zawierają metody pomocnicze do weryfikacji:

```typescript
// Zamiast:
const name = await page.getByTestId("flat-detail-name").textContent();
const address = await page.getByTestId("flat-detail-address").textContent();
expect(name).toBe("Expected Name");
expect(address).toBe("Expected Address");

// Użyj:
await flatDetail.verifyFlatDetails("Expected Name", "Expected Address");
```

## Konwencje

### Nazewnictwo

1. **Klasy:** `{Component}Page` (np. `FlatFormPage`, `DashboardPage`)
2. **Pliki:** `{component}.page.ts` (kebab-case)
3. **Locatory:** camelCase, opisowe (np. `addFlatButton`, `nameInput`)
4. **Metody:**
   - Akcje: czasowniki (np. `goto()`, `fillForm()`, `clickEdit()`)
   - Gettery: `get{Property}()` (np. `getName()`, `getTotalDebt()`)
   - Checkers: `is{State}()` lub `has{Property}()` (np. `isVisible()`, `hasError()`)

### Locatory

Preferuj `data-testid` dla stabilności:

```typescript
// ✅ Dobre - stabilne
this.nameInput = page.getByTestId("flat-name-input");

// ❌ Unikaj - niestabilne
this.nameInput = page.locator('input[name="name"]');
this.nameInput = page.locator(".form-input:nth-child(1)");
```

### Metody

Enkapsuluj powtarzalne sekwencje akcji:

```typescript
// Zamiast powtarzania w każdym teście:
await nameInput.fill('Name');
await addressInput.fill('Address');
await submitButton.click();

// Stwórz metodę:
async createFlat(name: string, address: string) {
  await this.fillForm(name, address);
  await this.submit();
}
```

## Import i użycie

### Importowanie z barrel export

```typescript
import { HeaderNavigationPage, FlatFormPage, FlatDetailPage, DashboardPage } from "./page-objects";
```

### Inicjalizacja w testach

```typescript
test("my test", async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const flatForm = new FlatFormPage(page);

  // Użyj obiektów POM
  await dashboard.goto();
  await flatForm.gotoCreate();
});
```

## Testowanie

Uruchom testy:

```bash
# Wszystkie testy E2E
npx playwright test

# Konkretny plik
npx playwright test e2e/create-flat.spec.ts

# Z UI
npx playwright test --ui

# Z debuggerem
npx playwright test --debug
```

## Rozszerzanie POM

Gdy dodajesz nowe komponenty:

1. Utwórz nowy plik `{component}.page.ts` w `e2e/page-objects/`
2. Zaimplementuj klasę wg wzorca istniejących POM
3. Dodaj export do `index.ts`
4. Użyj `data-testid` w komponentach
5. Stwórz testy używające nowego POM
