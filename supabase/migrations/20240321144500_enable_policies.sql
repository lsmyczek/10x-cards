-- Migration: Re-enable RLS policies
-- Description: Restores all policies that were disabled in the previous migration
-- Author: AI Assistant
-- Date: 2024-03-21

-- Enable RLS on all tables
alter table generations enable row level security;
alter table flashcards enable row level security;
alter table generations_error_logs enable row level security;

-- Recreate policies for generations table
create policy "Users can view their own generations"
    on generations
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own generations"
    on generations
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on generations
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
    on generations
    for delete
    using (auth.uid() = user_id);

-- Recreate policies for flashcards table
create policy "Users can view their own flashcards"
    on flashcards
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
    on flashcards
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards
    for delete
    using (auth.uid() = user_id);

-- Recreate policies for generations_error_logs table
create policy "Users can view their own error logs"
    on generations_error_logs
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generations_error_logs
    for insert
    with check (auth.uid() = user_id); 