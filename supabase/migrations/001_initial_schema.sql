-- Enable UUID extension
create extension if not exists pgcrypto;

-- ============================================
-- 1. clients — Профили на фирми и абонати
-- ============================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  contact_name text,
  delivery_channel text not null default 'email' check (delivery_channel in ('email', 'telegram')),
  delivery_target text not null,
  keywords text[] not null default '{}',
  regions text[] not null default '{}',
  min_budget_bgn numeric not null default 0,
  client_notes text,
  plan_status text not null default 'lead_trial' check (plan_status in ('lead_trial', 'active_paid', 'paused')),
  frequency text not null default 'twice_weekly' check (frequency in ('daily', 'twice_weekly', 'weekly')),
  created_at timestamptz not null default now()
);

-- ============================================
-- 2. tenders — Извлечени обществени поръчки
-- ============================================
create table tenders (
  id uuid primary key default gen_random_uuid(),
  external_ref_id text not null unique,
  source_url text not null,
  title text not null,
  contracting_authority text not null,
  region text,
  estimated_value_bgn numeric,
  submission_deadline timestamptz,
  raw_extracted_text text,
  content_hash text,
  scraped_at timestamptz not null default now()
);

-- ============================================
-- 3. matches_analysis — Персонализиран AI анализ
-- ============================================
create table matches_analysis (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  tender_id uuid not null references tenders(id) on delete cascade,
  relevance_score int not null check (relevance_score >= 0 and relevance_score <= 100),
  verdict text,
  summary_json jsonb not null default '{}',
  is_included_in_report boolean not null default false,
  report_id uuid,
  analyzed_at timestamptz not null default now(),
  unique (client_id, tender_id)
);

-- ============================================
-- 4. outbound_reports — Журнал на изпратените отчети
-- ============================================
create table outbound_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  tenders_count int not null default 0,
  delivery_channel text not null,
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'failed', 'opened', 'replied')),
  sent_at timestamptz not null default now(),
  client_feedback text
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table clients enable row level security;
alter table tenders enable row level security;
alter table matches_analysis enable row level security;
alter table outbound_reports enable row level security;

-- clients: пользователят вижда само своя профиль
create policy "Users can view own client profile"
  on clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own client profile"
  on clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own client profile"
  on clients for update
  using (auth.uid() = user_id);

-- tenders: всички auth потребители могат да четат поръчки
create policy "Authenticated users can view tenders"
  on tenders for select
  to authenticated
  using (true);

-- matches_analysis: вижда само анализите на своя клиент
create policy "Users can view own match analysis"
  on matches_analysis for select
  using (
    exists (
      select 1 from clients
      where clients.id = matches_analysis.client_id
      and clients.user_id = auth.uid()
    )
  );

-- outbound_reports: вижда само отчетите на своя клиент
create policy "Users can view own outbound reports"
  on outbound_reports for select
  using (
    exists (
      select 1 from clients
      where clients.id = outbound_reports.client_id
      and clients.user_id = auth.uid()
    )
  );

-- ============================================
-- Indexes
-- ============================================
create index idx_tenders_external_ref on tenders(external_ref_id);
create index idx_tenders_deadline on tenders(submission_deadline);
create index idx_matches_client on matches_analysis(client_id);
create index idx_matches_tender on matches_analysis(tender_id);
create index idx_matches_score on matches_analysis(relevance_score);
create index idx_outbound_client on outbound_reports(client_id);