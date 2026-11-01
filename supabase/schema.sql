-- Run this in Supabase SQL Editor before connecting the application.
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'assistant', 'accountant', 'employee');
create type public.attendance_kind as enum ('check_in', 'check_out', 'leave_start', 'leave_end', 'auto_checkout');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  first_name text not null,
  last_name text,
  role public.app_role not null default 'employee',
  phone text,
  national_id text,
  hourly_rate bigint check (hourly_rate is null or hourly_rate >= 0),
  leave_limit_minutes integer check (leave_limit_minutes is null or leave_limit_minutes >= 0),
  avatar_url text,
  avatar_approved boolean not null default false,
  overtime_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  kind public.attendance_kind not null,
  occurred_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id),
  note text,
  needs_explanation boolean not null default false
);
create index attendance_employee_time_idx on public.attendance_events(employee_id, occurred_at);

create table public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null,
  body text not null,
  created_at timestamptz not null default now(),
  unique(employee_id, work_date)
);

create table public.app_settings (
  id boolean primary key default true check (id),
  organization_name text not null default 'نوآوران فردا',
  theme text not null default 'mint' check (theme in ('mint','dark','blue','brown','mono')),
  font_family text not null default 'vazirmatn',
  admin_login_path text not null default '/admin',
  employee_login_path text not null default '/login',
  updated_at timestamptz not null default now()
);
insert into public.app_settings default values on conflict do nothing;

-- Roles must be assigned by a trusted server process. Never expose the service key in a browser.
alter table public.profiles enable row level security;
alter table public.attendance_events enable row level security;
alter table public.payroll_periods enable row level security;
alter table public.daily_reports enable row level security;
alter table public.app_settings enable row level security;

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create policy "read own profile or admins" on public.profiles for select to authenticated
using (id = auth.uid() or public.current_role() in ('admin','assistant','accountant'));
create policy "admin and assistant manage employees" on public.profiles for insert to authenticated
with check (public.current_role() in ('admin','assistant') and role in ('employee','accountant'));
create policy "admin and assistant update staff; admin manages privileged roles" on public.profiles for update to authenticated
using (public.current_role() in ('admin','assistant') and (role not in ('admin','assistant') or public.current_role() = 'admin'))
with check ((public.current_role() = 'admin') or (public.current_role() = 'assistant' and role in ('employee','accountant')));

create policy "staff and accountants read attendance" on public.attendance_events for select to authenticated
using (employee_id = auth.uid() or public.current_role() in ('admin','assistant','accountant'));
create policy "employees record own attendance; managers record team" on public.attendance_events for insert to authenticated
with check ((employee_id = auth.uid() and public.current_role() = 'employee') or public.current_role() in ('admin','assistant'));
create policy "admin and assistant manage periods" on public.payroll_periods for all to authenticated
using (public.current_role() in ('admin','assistant')) with check (public.current_role() in ('admin','assistant'));
create policy "accountants and managers read periods" on public.payroll_periods for select to authenticated
using (public.current_role() in ('admin','assistant','accountant'));
create policy "employees manage own reports" on public.daily_reports for all to authenticated
using (employee_id = auth.uid()) with check (employee_id = auth.uid());
create policy "managers read all reports" on public.daily_reports for select to authenticated
using (public.current_role() in ('admin','assistant'));
create policy "signed in can read settings" on public.app_settings for select to authenticated using (true);
create policy "admin and assistant update settings" on public.app_settings for update to authenticated
using (public.current_role() in ('admin','assistant')) with check (public.current_role() in ('admin','assistant'));

-- Important production setup:
-- 1. Create the first admin through Supabase Auth, then set its profile role to 'admin' from SQL Editor.
-- 2. Never seed admin/admin on a public deployment; require a unique password and rotate it at first login.
-- 3. Implement a scheduled server job in Tehran time that inserts auto_checkout at 00:00 for open shifts.
-- 4. Generate TOTP enrollment secrets server-side, encrypt them, and verify codes on the server. A Google email
--    address alone cannot link a user to Google Authenticator; authenticator apps use a shared TOTP secret.
