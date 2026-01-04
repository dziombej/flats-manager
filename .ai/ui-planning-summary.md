# UI Architecture Planning Summary

## Podjęte Decyzje

1. **Paginacja**: Brak paginacji - wszystkie mieszkania wyświetlane na jednej stronie (założenie 2-10 mieszkań)
2. **Layout**: Globalny layout z persistent topbar (logo, link Dashboard, info o użytkowniku, przycisk Wyloguj)
3. **Routing**: Struktura zgodnie z rekomendacją (`/`, `/login`, `/dashboard`, `/flats/[id]`, `/flats/[id]/edit`, `/flats/new`)
4. **Filtr czasowy**: Lokalny stan React w widoku szczegółów mieszkania z persystencją w URL query params
5. **Service Layer**: Dedykowana warstwa serwisów w `src/lib/services/` (flatsService, paymentTypesService, paymentsService, dashboardService)
6. **Stany UI**: Reużywalne komponenty pomocnicze (LoadingSpinner, ErrorMessage, EmptyState)
7. **Formularze**: Hybrydowe podejście - React components z react-hook-form + Zod, shared schemas w `src/types.ts`
8. **Notyfikacje**: Toast notifications (sonner) dla sukcesu/błędów, inline messages dla walidacji
9. **Lista opłat**: Hierarchia komponentów React (PaymentsList → PaymentsFilter → PaymentsTable → PaymentRow) z optimistic updates
10. **Breadcrumbs**: Tak - komponent Breadcrumbs.astro z automatycznym generowaniem na podstawie URL i danych API

## Kluczowe Zalecenia Architektoniczne

### Struktura Routingu
```
/                           → redirect do /dashboard lub /login
/login                      → strona logowania
/dashboard                  → lista mieszkań z zadłużeniem
/flats/new                  → formularz dodawania mieszkania
/flats/[id]                 → szczegóły mieszkania (PaymentTypes + Payments)
/flats/[id]/edit            → edycja mieszkania
```

### Service Layer (`src/lib/services/`)
- `dashboardService.ts` - GET /api/dashboard
- `flatsService.ts` - CRUD dla mieszkań
- `paymentTypesService.ts` - zarządzanie typami płatności
- `paymentsService.ts` - generowanie i zarządzanie płatnościami

Wszystkie serwisy używają `SupabaseClient` z `context.locals`.

### Komponenty UI

**Helpers (`src/components/`):**
- `LoadingSpinner.astro` - stan ładowania
- `ErrorMessage.tsx` - wyświetlanie błędów z retry
- `EmptyState.astro` - puste listy
- `Breadcrumbs.astro` - nawigacja breadcrumb

**Forms (`src/components/forms/`):**
- `FlatForm.tsx` - dodawanie/edycja mieszkania
- `PaymentTypeForm.tsx` - dodawanie/edycja typu płatności
- `PaymentGenerateForm.tsx` - generowanie płatności

**Payments (`src/components/payments/`):**
- `PaymentsList.tsx` - container z zarządzaniem stanem
- `PaymentsFilter.tsx` - filtr month/year
- `PaymentsTable.tsx` - tabela prezentacyjna
- `PaymentRow.tsx` - wiersz z akcją "Oznacz jako opłacone"

### Walidacja i State Management

**Shared Zod Schemas (`src/types.ts`):**
- `CreateFlatSchema` / `UpdateFlatSchema`
- `CreatePaymentTypeSchema` / `UpdatePaymentTypeSchema`
- `GeneratePaymentsSchema`
- `PaymentsQuerySchema`

**Zarządzanie stanem:**
- Formularze: `react-hook-form` + `@hookform/resolvers/zod`
- Filtr: `useState` + URL query params
- Notyfikacje: `sonner` toast library
- Optimistic updates: lokalna aktualizacja + revalidation po sukcesie

### Integracja z API

**Wzorzec komunikacji:**
1. Komponent wywołuje metodę z service layer
2. Service używa `SupabaseClient` z RLS
3. Obsługa błędów w service → zwrot typed error
4. Komponent wyświetla toast (sukces/błąd)
5. Revalidation danych po mutacji

**Obsługa stanów:**
```tsx
{ isLoading ? <LoadingSpinner /> 
  : error ? <ErrorMessage error={error} onRetry={refetch} /> 
  : data.length === 0 ? <EmptyState message="Brak mieszkań" /> 
  : <DataList data={data} /> 
}
```

### UX i Dostępność

**Desktop-first (min-width: 1024px):**
- Brak responsywności mobilnej w MVP
- Optymalizacja dla rozdzielczości desktopowych

**Nawigacja:**
- Persistent topbar z kluczowymi linkami
- Breadcrumbs dla orientacji w strukturze
- Astro View Transitions dla płynnych przejść

**Feedback użytkownika:**
- Toast notifications (auto-dismiss)
- Inline validation errors
- Visual distinction (paid vs unpaid payments)
- Loading states z skeleton loaders

**Dostępność:**
- ARIA labels dla interaktywnych elementów
- Keyboard navigation
- Focus management w formularzach

## Następne Kroki

### Etap 1: Infrastruktura
1. Utworzenie głównego layoutu z topbar
2. Implementacja breadcrumbs component
3. Konfiguracja View Transitions
4. Setup sonner dla toast notifications

### Etap 2: Service Layer
1. Implementacja wszystkich serwisów w `src/lib/services/`
2. Shared Zod schemas w `src/types.ts`
3. Centralna obsługa błędów

### Etap 3: Komponenty Pomocnicze
1. LoadingSpinner, ErrorMessage, SuccessMessage, EmptyState
2. Reużywalne form components z obsługą inline messages

### Etap 4: Główne Widoki
1. Login page
2. Dashboard z listą mieszkań
3. Szczegóły mieszkania z PaymentTypes i Payments
4. Formularze CRUD

### Etap 5: Zaawansowane Features
1. Filtrowanie płatności z URL persistence
2. Optimistic updates dla mark-as-paid
3. Generowanie płatności z feedback

## Uwagi Techniczne

- **Astro 5** dla SSR i static pages
- **React 19** Islands dla interaktywności (`client:load`)
- **Tailwind 4** dla stylowania
- **Shadcn/ui** dla base components
- **Supabase** z RLS dla bezpieczeństwa
- Brak globalnego state managera (wystarczy local state + URL params)

