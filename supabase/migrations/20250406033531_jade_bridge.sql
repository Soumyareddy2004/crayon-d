/*
  # Initial Schema Setup for Retirement Advisor

  1. New Tables
    - `user_profiles`: Stores user financial information and preferences
      - `id` (uuid, primary key)
      - `risk_tolerance` (text)
      - `retirement_goal` (numeric)
      - `current_age` (integer)
      - `target_retirement_age` (integer)
      - `monthly_contribution` (numeric)
      - `current_portfolio` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chat_history`: Stores conversation history with embeddings
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `role` (text)
      - `content` (text)
      - `embedding` (vector(1536))
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable pgvector extension
create extension if not exists vector;

-- Create user_profiles table
create table if not exists user_profiles (
  id uuid references auth.users primary key,
  risk_tolerance text check (risk_tolerance in ('low', 'moderate', 'high')),
  retirement_goal numeric not null,
  current_age integer not null,
  target_retirement_age integer not null,
  monthly_contribution numeric not null,
  current_portfolio jsonb not null default '{"stocks": 0, "bonds": 0, "cash": 0}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create chat_history table with vector support
create table if not exists chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table user_profiles enable row level security;
alter table chat_history enable row level security;

-- Create policies for user_profiles
create policy "Users can read own profile"
  on user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles
  for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Create policies for chat_history
create policy "Users can read own chat history"
  on chat_history
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on chat_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create function to update user_profiles updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for user_profiles updated_at
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_updated_at_column();