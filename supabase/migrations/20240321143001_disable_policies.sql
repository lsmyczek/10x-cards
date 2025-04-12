-- Migration: Disable all RLS policies
-- Description: Drops all policies created in the initial schema migration
-- Author: AI Assistant
-- Date: 2024-03-21

-- Drop policies for generations table
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can insert their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;
drop policy if exists "Users can delete their own generations" on generations;

-- Drop policies for flashcards table
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can insert their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

-- Drop policies for generations_error_logs table
drop policy if exists "Users can view their own error logs" on generations_error_logs;
drop policy if exists "Users can insert their own error logs" on generations_error_logs;

-- Disable RLS on all tables
alter table generations disable row level security;
alter table flashcards disable row level security;
alter table generations_error_logs disable row level security; 