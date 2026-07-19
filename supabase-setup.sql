-- Run this in your Supabase project's SQL editor (Database -> SQL Editor -> New query)

create table if not exists public.reviews (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  text text not null check (char_length(text) <= 500 and char_length(btrim(text)) > 0),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Anyone visiting the site can read all reviews
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

-- Anyone can post a review, with basic server-side validation
create policy "Anyone can post reviews"
  on public.reviews for insert
  with check (
    char_length(btrim(name)) > 0
    and char_length(name) <= 80
    and rating between 1 and 5
    and char_length(btrim(text)) > 0
    and char_length(text) <= 500
  );

-- Seed with sample reviews (optional — remove or edit as you like)
insert into public.reviews (name, rating, text, created_at) values
  ('Ananya Sharma', 5, 'The chicken samosas are unreal — cook in 6 minutes, taste like a proper Delhi street stall. Ordering weekly now.', now() - interval '9 days'),
  ('Jasmine', 4, 'Seekh kabab is my go-to weekend snack. Marinade is spot on.', now() - interval '4 days'),
  ('Kamaluddin', 5, 'Delivery was quick and everything was rock solid frozen. The shami kebabs melted in my mouth. Highly recommended!', now() - interval '1 day');
