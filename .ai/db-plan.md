# Schemat bazy danych PostgreSQL dla projektu 10x-cards

## 1. Tabele i kolumny:

---

### 1.1 users

**Opis:** Tabela zarządzana przez Supabase.

- id: UUID PRIMARY KEY
- email: VARCHAR UNIQUE NOT NULL
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
- confirmed_at: TIMESTAMP WITH TIME ZONE

---

### 1.2 flashcards

**Opis:** Przechowuje fiszki tworzone ręcznie oraz generowane przez AI. Identyfikator typu SERIAL.

- id: BIGSERIAL PRIMARY KEY
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- source: VARCHAR NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW() 
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- generation_id: BIGINT REFERENCES generation(id) ON DELETE SET NULL

**Trigger:** 
- Automatically update the `updated_at` column on record updates.

**Indeksy:**
- INDEX na kolumnie user_id
- INDEX na kolumnie generation_id

---

### 1.3 generations

**Opis:** Rejestracja operacji generowania fiszek przez AI. Identyfikator typu BIGSERIAL.

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- model: VARCHAR NOT NULL
- generated_count: INTEGER NOT NULL
- accepted_unedited_count: INTEGER NULLABLE
- accepted_edited_count: INTEGER NULLABLE
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- generation_duration: INTEGER NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL

**Indeksy:**
- INDEX na kolumnie user_id

---

### 1.4 generations_error_logs

**Opis:** Log błędów operacji generowania fiszek przez AI. Identyfikator typu BIGSERIAL.

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- model: VARCHAR NOT NULL
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- error_code: VARCHAR NOT NULL
- error_message: TEXT NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL

**Indeksy:**
- INDEX na kolumnie user_id

---

## 2. Relacje między tabelami:

- Jeden użytkownik (users) może posiadać wiele rekordów w tabelach flashcards, generations oraz generations_error_logs (relacja 1:N).
- Każda fiszka (flashcards) może opcjonalnie odnosić się do jednej generacji (generations) poprzez generation_id

## 3. Indeksy:

- Utworzenie indeksów na kolumnach user_id w tabelach flashcards, generations oraz generations_error_logs dla optymalizacji zapytań.
- Utworzenie indeksu na kolumnie generation_id w tabeli flashcards

## 4. Zasady RLS (Row-Level Security):

Dla tabel flashcards, generations oraz generations_error_logs należy wdrożyć polityki RLS, które pozwalają dostęp jedynie do rekordów, gdzie user_id odpowiada identyfikatorowi użytkownika aktualnie zalogowanego przez Supabase Auth.

Przykładowa polityka RLS (do wdrożenia jako część migracji):

  CREATE POLICY user_isolation ON <table>
    FOR ALL
    USING (user_id = auth.uid());

## 5. Dodatkowe uwagi:

- Wszystkie klucze obce posiadają akcję ON DELETE CASCADE dla zachowania spójności danych.
- Ograniczenia długości dla pól tekstowych są definiowane poprzez typy VARCHAR oraz CHECK constraints.
- Trigger w tabeli flashcards ma automatycznie aktualizować kolumnę `updated_at` przy każdej modyfikacji rekordu

