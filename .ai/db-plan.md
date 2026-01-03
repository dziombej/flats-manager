# Database Schema - flat-manager

## 1. Tables

### 1.1. profiles

Extends Supabase Auth (`auth.users`) with application-specific user data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FOREIGN KEY → auth.users.id ON DELETE CASCADE | User identifier |
| email | TEXT | NOT NULL | User email (duplicate from auth.users for convenience) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record last update timestamp |

**Notes:**
- Profile is automatically created when user registers via Supabase Auth
- Email field is duplicated for performance (avoiding joins with auth.users)

---

### 1.2. flats

Stores apartment data managed by landlords.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Flat identifier |
| user_id | UUID | NOT NULL, FOREIGN KEY → auth.users.id ON DELETE CASCADE | Owner identifier |
| name | TEXT | NOT NULL | Flat name (e.g., "Żoliborz 1") |
| address | TEXT | NOT NULL | Flat address |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record last update timestamp |

**Business Rules:**
- Each user can have multiple flats (1:N relationship)
- Flat name does not have to be unique (MVP allows duplicates)
- Deleting user cascades to all their flats

---

### 1.3. payment_types

Defines recurring payment templates for each flat.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Payment type identifier |
| flat_id | UUID | NOT NULL, FOREIGN KEY → flats.id ON DELETE CASCADE | Flat identifier |
| name | TEXT | NOT NULL | Payment type name (e.g., "Rent", "Utilities") |
| base_amount | NUMERIC(10,2) | NOT NULL, CHECK (base_amount >= 0) | Base payment amount in PLN |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record last update timestamp |

**Business Rules:**
- Each flat has 1:N payment types
- Payment type name does not have to be unique within flat
- base_amount must be non-negative (check constraint)
- Deleting flat cascades to all its payment types
- NUMERIC(10,2) provides precision for monetary values (max 99,999,999.99 PLN)
- Changing base_amount affects only future payment generations

**MVP Constraints:**
- Flat must have minimum 1 payment type (validated at application level)
- No ability to delete payment types in MVP (REQ-PTYPE-003)

---

### 1.4. payments

Stores generated monthly payment instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Payment identifier |
| payment_type_id | UUID | NOT NULL, FOREIGN KEY → payment_types.id ON DELETE CASCADE | Payment type identifier |
| amount | NUMERIC(10,2) | NOT NULL, CHECK (amount >= 0) | Payment amount (copied from base_amount at generation) |
| month | INTEGER | NOT NULL, CHECK (month >= 1 AND month <= 12) | Payment month (1-12) |
| year | INTEGER | NOT NULL, CHECK (year >= 1900 AND year <= 2100) | Payment year |
| is_paid | BOOLEAN | NOT NULL, DEFAULT false | Payment status (paid/unpaid) |
| paid_at | TIMESTAMP WITH TIME ZONE | NULL, CHECK (is_paid = false OR paid_at IS NOT NULL) | Payment timestamp (set when marked as paid) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Record last update timestamp |

**Unique Constraints:**
- UNIQUE (payment_type_id, month, year) - prevents duplicate payments for same type and period

**Business Rules:**
- Each payment type can have multiple payment instances (1:N relationship)
- amount is copied from payment_type.base_amount at generation time
- amount does not change when base_amount is updated (historical data preservation)
- Deleting payment type cascades to all its payments
- paid_at must be set when is_paid = true (check constraint)
- paid_at can be NULL when is_paid = false
- Paid payments cannot be edited (enforced at application level)

**MVP Constraints:**
- No ability to edit or delete payments in MVP (REQ-PAY-007)
- No ability to change status from paid to unpaid

---

## 2. Relationships

### 2.1. Entity Relationship Diagram

```
auth.users (Supabase Auth)
    ↓ 1:1 (ON DELETE CASCADE)
public.profiles

auth.users
    ↓ 1:N (user_id, ON DELETE CASCADE)
public.flats
    ↓ 1:N (flat_id, ON DELETE CASCADE)
public.payment_types
    ↓ 1:N (payment_type_id, ON DELETE CASCADE)
public.payments
```

### 2.2. Relationship Details

**auth.users → profiles (1:1)**
- One user has one profile (optional extension)
- Cascade delete: deleting user deletes profile

**auth.users → flats (1:N)**
- One user can have multiple flats
- Each flat belongs to exactly one user
- Cascade delete: deleting user deletes all their flats

**flats → payment_types (1:N)**
- One flat can have multiple payment types
- Each payment type belongs to exactly one flat
- Cascade delete: deleting flat deletes all its payment types
- Business constraint: minimum 1 payment type per flat (validated at application level)

**payment_types → payments (1:N)**
- One payment type can have multiple payment instances (monthly)
- Each payment belongs to exactly one payment type
- Cascade delete: deleting payment type deletes all its payments
- Unique constraint: one payment per payment type per month/year

---

## 3. Indexes

### 3.1. Performance Indexes

```sql
-- Flat ownership queries (dashboard, RLS)
CREATE INDEX idx_flat_user_id ON flats(user_id);

-- Payment type queries (joins with flats)
CREATE INDEX idx_payment_type_flat_id ON payment_types(flat_id);

-- Payment queries (joins with payment types)
CREATE INDEX idx_payment_payment_type_id ON payments(payment_type_id);

-- Unpaid payment filtering (dashboard debt calculation)
CREATE INDEX idx_payment_is_paid ON payments(is_paid);

-- Time-based payment filtering
CREATE INDEX idx_payment_month_year ON payments(month, year);
```

### 3.2. Index Justification

| Index | Purpose | Queries Optimized |
|-------|---------|-------------------|
| idx_flat_user_id | User's flat list, RLS policies | Dashboard, flat filtering |
| idx_payment_type_flat_id | Joining payment types with flats | Payment generation, RLS |
| idx_payment_payment_type_id | Joining payments with payment types | Payment list, debt calculation |
| idx_payment_is_paid | Filtering unpaid payments | Dashboard debt, default payment view |
| idx_payment_month_year | Time-based filtering | Month/year payment filter |

**Performance Assumptions:**
- 2-10 flats per user (MVP target)
- 3-5 payment types per flat
- ~12 payments per year per payment type
- Total ~360-600 payments/year/user
- No pagination needed for MVP

---

## 4. PostgreSQL Policies (Row Level Security)

### 4.1. Enable RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

### 4.2. Profiles Policies

```sql
-- Users can read and update only their own profile
CREATE POLICY "Users can manage their own profile"
ON profiles FOR ALL
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

### 4.3. Flats Policies

```sql
-- Users can manage only their own flats
CREATE POLICY "Users can manage their own flats"
ON flats FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

**Explanation:**
- Direct ownership check via user_id column
- Protects all operations: SELECT, INSERT, UPDATE, DELETE
- User can only access flats where user_id matches their authenticated ID

### 4.4. Payment Types Policies

```sql
-- Users can manage payment types of their own flats
CREATE POLICY "Users can manage payment types of their flats"
ON payment_types FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM flats
    WHERE flats.id = payment_types.flat_id
    AND flats.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM flats
    WHERE flats.id = payment_types.flat_id
    AND flats.user_id = auth.uid()
  )
);
```

**Explanation:**
- Indirect ownership check through flat relationship
- Payment type is accessible only if associated flat belongs to user
- Prevents accessing payment types through direct ID manipulation

### 4.5. Payments Policies

```sql
-- Users can manage payments of their own flats
CREATE POLICY "Users can manage payments of their flats"
ON payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM payment_types pt
    JOIN flats f ON pt.flat_id = f.id
    WHERE pt.id = payments.payment_type_id
    AND f.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM payment_types pt
    JOIN flats f ON pt.flat_id = f.id
    WHERE pt.id = payments.payment_type_id
    AND f.user_id = auth.uid()
  )
);
```

**Explanation:**
- Double indirect ownership check: payment → payment_type → flat → user
- Payment is accessible only if its payment type's flat belongs to user
- Most complex RLS policy due to deepest nesting level

### 4.6. RLS Testing Recommendations

Test scenarios:
1. User A cannot see flats of User B
2. User A cannot see payment types of User B's flats
3. User A cannot see payments of User B's flats
4. User A cannot modify User B's data through API
5. Direct database queries respect RLS when using auth.uid()

---

## 5. Database Triggers

### 5.1. Auto-update Trigger for updated_at

```sql
-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flats_updated_at
  BEFORE UPDATE ON flats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_types_updated_at
  BEFORE UPDATE ON payment_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Alternative (Supabase Extension):**
```sql
-- If using Supabase moddatetime extension
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON flats
FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON payment_types
FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

---

## 6. Key Database Queries

### 6.1. Dashboard - Debt per Flat

```sql
-- Calculate total debt for each user's flat
SELECT 
  f.id,
  f.name,
  f.address,
  COALESCE(SUM(CASE WHEN p.is_paid = false THEN p.amount ELSE 0 END), 0) as debt
FROM flats f
LEFT JOIN payment_types pt ON pt.flat_id = f.id
LEFT JOIN payments p ON p.payment_type_id = pt.id
WHERE f.user_id = auth.uid()
GROUP BY f.id, f.name, f.address
ORDER BY f.name;
```

**Performance:**
- Uses idx_flat_user_id for user filtering
- Uses idx_payment_type_flat_id for first join
- Uses idx_payment_payment_type_id for second join
- Uses idx_payment_is_paid for WHERE clause

### 6.2. Generate Monthly Payments

```sql
-- Generate payments for all payment types of a flat for specific month/year
INSERT INTO payments (payment_type_id, amount, month, year)
SELECT 
  pt.id,
  pt.base_amount,
  $month,
  $year
FROM payment_types pt
WHERE pt.flat_id = $flat_id
ON CONFLICT (payment_type_id, month, year) DO NOTHING;
```

**Features:**
- Copies base_amount to amount at generation time
- ON CONFLICT handles duplicate prevention gracefully
- Returns number of inserted rows (partial generation on conflict)

### 6.3. Unpaid Payments for Flat

```sql
-- List all unpaid payments for a flat
SELECT 
  p.id,
  pt.name as payment_type_name,
  p.amount,
  p.month,
  p.year,
  p.is_paid,
  p.paid_at,
  p.created_at
FROM payments p
JOIN payment_types pt ON pt.id = p.payment_type_id
WHERE pt.flat_id = $flat_id
  AND p.is_paid = false
ORDER BY p.year DESC, p.month DESC;
```

**Performance:**
- Uses idx_payment_payment_type_id for join
- Uses idx_payment_is_paid for filtering

### 6.4. Mark Payment as Paid

```sql
-- Update payment status to paid
UPDATE payments
SET 
  is_paid = true,
  paid_at = NOW()
WHERE id = $payment_id
  AND is_paid = false;
```

**Business Logic:**
- Sets both is_paid and paid_at atomically
- WHERE clause prevents re-marking already paid payments
- Check constraint ensures paid_at is NOT NULL when is_paid = true

### 6.5. Filter Payments by Month/Year

```sql
-- List payments for specific month and year
SELECT 
  p.id,
  pt.name as payment_type_name,
  p.amount,
  p.month,
  p.year,
  p.is_paid,
  p.paid_at
FROM payments p
JOIN payment_types pt ON pt.id = p.payment_type_id
WHERE pt.flat_id = $flat_id
  AND p.month = $month
  AND p.year = $year
ORDER BY pt.name;
```

**Performance:**
- Uses idx_payment_month_year for time filtering
- Uses idx_payment_payment_type_id for join

---

## 7. Seed Data

### 7.1. Test Users

```sql
-- User 1: admin@flatmanager.local (password: password123)
-- User 2: test@flatmanager.local (password: password123)
-- Passwords are hashed by Supabase Auth automatically
```

### 7.2. User 1 Data (admin@flatmanager.local)

**Flat 1: "Żoliborz 1"**
- Address: "ul. Słowackiego 1"
- Payment Types:
  - "Czynsz": 1000.00 PLN
  - "Administracja": 200.00 PLN

**Flat 2: "Mokotów 2"**
- Address: "ul. Puławska 2"
- Payment Types:
  - "Czynsz": 1500.00 PLN

**Flat 3: "Praga 3"**
- Address: "ul. Targowa 3"
- Payment Types:
  - "Czynsz": 800.00 PLN
  - "Media": 150.00 PLN

### 7.3. User 2 Data (test@flatmanager.local)

- No flats (empty dashboard for testing)

### 7.4. Seed Script Requirements

- Idempotent (can be run multiple times without errors)
- Uses ON CONFLICT DO NOTHING for users
- Checks for existing data before insertion
- Creates profiles automatically for auth users
- Documented credentials in README.md

---

## 8. Data Validation

### 8.1. Database-Level Validation (Check Constraints)

| Constraint | Table | Rule | Purpose |
|------------|-------|------|---------|
| base_amount >= 0 | payment_types | Non-negative base amount | Prevents negative payment templates |
| amount >= 0 | payments | Non-negative amount | Prevents negative payments |
| month >= 1 AND month <= 12 | payments | Valid month range | Ensures valid month values |
| year >= 1900 AND year <= 2100 | payments | Reasonable year range | Prevents unrealistic years |
| is_paid = false OR paid_at IS NOT NULL | payments | Paid status consistency | Ensures paid_at is set when payment is marked as paid |

### 8.2. Application-Level Validation

| Validation | Level | Purpose |
|------------|-------|---------|
| Required fields | UI/API | Ensures all mandatory fields are filled |
| Email format | UI/API | Validates email structure |
| Amount non-negative | UI/API | First line of defense (backed by DB constraint) |
| Month 1-12 | UI/API | First line of defense (backed by DB constraint) |
| Year integer | UI/API | Type validation |
| Minimum 1 PaymentType | API | Business rule (MVP: no deletion possible) |
| Cannot edit paid payment | API | Business rule |

### 8.3. Unique Constraints

| Constraint | Table | Columns | Purpose |
|------------|-------|---------|---------|
| PRIMARY KEY | All tables | id | Unique record identification |
| UNIQUE | payments | (payment_type_id, month, year) | Prevents duplicate payments |

**Note:** No unique constraint on names (flats, payment_types) - duplicates allowed in MVP

---

## 9. Data Types Rationale

### 9.1. UUID for Primary Keys

**Decision:** Use UUID (gen_random_uuid()) instead of SERIAL/BIGSERIAL

**Rationale:**
- Compatible with Supabase Auth (auth.users uses UUID)
- Better for distributed systems and replication
- Prevents ID enumeration attacks
- No sequential ID leakage (privacy)
- Standard in modern applications

### 9.2. NUMERIC(10,2) for Monetary Values

**Decision:** Use NUMERIC(10,2) instead of FLOAT/REAL/DOUBLE

**Rationale:**
- Exact decimal precision (no floating-point errors)
- Industry standard for financial data
- 10 digits total, 2 decimal places (max: 99,999,999.99 PLN)
- Sufficient for 2-10 apartments with typical Polish rent prices
- Complies with REQ-DATA-003

### 9.3. TIMESTAMP WITH TIME ZONE

**Decision:** Use TIMESTAMP WITH TIME ZONE instead of TIMESTAMP

**Rationale:**
- Time zone awareness (important for international users)
- UTC storage with automatic conversion
- Prevents daylight saving time issues
- Best practice for multi-timezone applications
- Supabase default

### 9.4. TEXT vs VARCHAR

**Decision:** Use TEXT for all string fields

**Rationale:**
- PostgreSQL stores both identically (no performance difference)
- TEXT is more flexible (no arbitrary length limits)
- Easier to change without migration
- PostgreSQL best practice

### 9.5. BOOLEAN for is_paid

**Decision:** Use BOOLEAN instead of INTEGER/VARCHAR

**Rationale:**
- Semantic clarity (true/false vs 0/1)
- Type safety
- Storage efficiency (1 byte)
- Standard for binary states

---

## 10. Scalability Considerations

### 10.1. Current MVP Assumptions

- 2-10 flats per user
- 3-5 payment types per flat
- ~12 payments per year per payment type
- Total: ~360-600 payments/year/user
- Small dataset: no pagination needed

### 10.2. Future Scalability Options

**If data grows beyond MVP assumptions:**

1. **Table Partitioning:**
   - Partition `payments` by year (range partitioning)
   - Improves query performance for time-based filtering
   - Easier data archival (drop old partitions)

2. **Materialized Views:**
   - Cache dashboard debt calculations
   - Refresh on payment status change
   - Reduces real-time calculation overhead

3. **Pagination:**
   - Add LIMIT/OFFSET to payment lists
   - Cursor-based pagination for better performance
   - Frontend infinite scroll or page navigation

4. **Archival Strategy:**
   - Move old paid payments to archive table
   - Keep only last N years in active table
   - Improves query performance

5. **Denormalization:**
   - Add `total_debt` column to flats (updated via trigger)
   - Eliminates SUM calculation on dashboard
   - Trade-off: complexity vs performance

### 10.3. Index Maintenance

- Regular VACUUM ANALYZE for statistics
- Monitor index usage with pg_stat_user_indexes
- Remove unused indexes if query patterns change
- Consider partial indexes (e.g., WHERE is_paid = false)

---

## 11. Security Best Practices

### 11.1. Authentication

- **Supabase Auth** handles password hashing (bcrypt)
- **JWT tokens** for session management
- **Automatic session expiry** configured in Supabase
- **Passwords never stored in plain text**

### 11.2. Authorization

- **Row Level Security (RLS)** on all public tables
- **Policies use auth.uid()** for user identification
- **Cascading ownership checks** for nested entities
- **No API bypasses** - RLS enforced at database level

### 11.3. SQL Injection Prevention

- **Parameterized queries** in application code
- **Never concatenate user input** into SQL strings
- **Supabase client** handles parameterization automatically
- **Use prepared statements** for raw SQL

### 11.4. Data Integrity

- **Foreign key constraints** prevent orphaned records
- **Check constraints** validate data at database level
- **NOT NULL constraints** ensure required data
- **Unique constraints** prevent duplicates
- **Cascade delete** maintains referential integrity

### 11.5. Audit Trail

- **created_at** timestamp on all records (who/when created)
- **updated_at** timestamp tracks last modification
- **paid_at** timestamp for payment audit
- Future enhancement: add `created_by`/`updated_by` columns

---

## 12. Migration Strategy

### 12.1. Initial Migration Order

1. Create `profiles` table (extends auth.users)
2. Create `flats` table
3. Create `payment_types` table
4. Create `payments` table
5. Create indexes
6. Enable RLS on all tables
7. Create RLS policies
8. Create triggers for updated_at
9. Run seed script

### 12.2. Rollback Strategy

- Each migration should have corresponding down migration
- Use transactions where possible
- Test migrations on staging environment first
- Backup database before major migrations

### 12.3. Supabase Migration Commands

```bash
# Create new migration
supabase migration new <migration_name>

# Run migrations
supabase db push

# Reset database (development only)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/db/database.types.ts
```

---

## 13. Additional Notes

### 13.1. Currency Handling

- **MVP assumption:** All amounts in PLN (Polish Złoty)
- **No currency field** in MVP (single currency)
- **Future enhancement:** Add `currency` column (VARCHAR(3), default 'PLN')
- **Display format:** "1 234.56 PLN" (space thousand separator, 2 decimals)

### 13.2. Timezone Handling

- **Storage:** All timestamps in UTC (database default)
- **Display:** Convert to user's local timezone in frontend
- **MVP default:** Europe/Warsaw for Polish users
- **Future enhancement:** User timezone preference in profiles

### 13.3. Soft Delete Consideration

- **MVP decision:** Hard delete with CASCADE
- **Rationale:** Simplicity, no recovery requirement
- **Future enhancement:** Add `deleted_at` column for soft delete
- **Benefit:** Data recovery, audit trail, undo functionality

### 13.4. Payment History Immutability

- **Design principle:** Historical payments are immutable
- **Rationale:** Financial data should not change retroactively
- **Implementation:** 
  - Paid payments cannot be edited (application logic)
  - Amount is copied at generation (not referenced)
  - Changing base_amount does not affect existing payments

### 13.5. Business Logic Location

**Database Level:**
- Referential integrity (foreign keys)
- Data validation (check constraints)
- Uniqueness (unique constraints)
- Cascade delete
- Auto-timestamps

**Application Level:**
- Minimum 1 PaymentType per Flat
- Cannot edit paid payment
- Payment generation logic
- Debt calculation (could be DB view/function)
- UI validation (duplicates DB validation)

### 13.6. Performance Monitoring

**Metrics to track:**
- Query execution time (aim: < 100ms for dashboard)
- Index hit ratio (aim: > 99%)
- Database connection pool usage
- Table size growth rate
- Most expensive queries (pg_stat_statements)

**Tools:**
- Supabase Dashboard (built-in monitoring)
- pg_stat_statements extension
- EXPLAIN ANALYZE for query optimization

---

## 14. Conclusion

This database schema provides a solid foundation for the flat-manager MVP with:

✅ **Complete data model** for 3 core entities (flats, payment_types, payments)  
✅ **Strong data integrity** through constraints and foreign keys  
✅ **Secure multi-tenant architecture** with Row Level Security  
✅ **Optimized performance** with strategic indexes  
✅ **Scalability path** for future growth  
✅ **Audit trail** with timestamps  
✅ **Clean cascade deletion** for data consistency  
✅ **Financial precision** with NUMERIC types  

The schema is ready for implementation via Supabase migrations and supports all functional requirements from the PRD and user stories.

**Next Steps:**
1. Create Supabase migration files from this schema
2. Implement seed data script
3. Generate TypeScript types for frontend
4. Test RLS policies with both test users
5. Validate all user stories against schema capabilities

