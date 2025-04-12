-- Migration: Initial schema setup for 10x-cards
-- Description: Creates flashcards, generations, and generations_error_logs tables with proper RLS
-- Author: AI Assistant
-- Date: 2024-03-21

-- Create updated_at trigger function first (needed by tables)
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create generations table first since flashcards references it
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create trigger for generations
create trigger update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_column();

-- Create flashcards table with reference to generations
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id bigint references generations(id) on delete set null
);

-- Create trigger for flashcards
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Create generations_error_logs table
create table generations_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create indexes
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);
create index generations_user_id_idx on generations(user_id);
create index generations_error_logs_user_id_idx on generations_error_logs(user_id);

-- Enable Row Level Security
alter table generations enable row level security;
alter table flashcards enable row level security;
alter table generations_error_logs enable row level security;

-- Create RLS policies for generations (since flashcards depends on it)
create policy "Users can view their own generations"
    on generations for select
    to authenticated
    using (user_id = auth.uid());

create policy "Users can insert their own generations"
    on generations for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Users can update their own generations"
    on generations for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "Users can delete their own generations"
    on generations for delete
    to authenticated
    using (user_id = auth.uid());

-- Create RLS policies for flashcards
create policy "Users can view their own flashcards"
    on flashcards for select
    to authenticated
    using (user_id = auth.uid());

create policy "Users can insert their own flashcards"
    on flashcards for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Users can update their own flashcards"
    on flashcards for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "Users can delete their own flashcards"
    on flashcards for delete
    to authenticated
    using (user_id = auth.uid());

-- Create RLS policies for generations_error_logs
create policy "Users can view their own error logs"
    on generations_error_logs for select
    to authenticated
    using (user_id = auth.uid());

create policy "Users can insert their own error logs"
    on generations_error_logs for insert
    to authenticated
    with check (user_id = auth.uid());

-- Note: Update and Delete policies for error_logs are intentionally omitted
-- as these records should be immutable 