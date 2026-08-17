-- Read-only audit of row level security. Nothing here modifies data or policies —
-- run it in the Supabase SQL Editor and review the output.

-- 1. Which tables have RLS enabled at all?
--    Any `false` on orders / profiles / cart_items / favorites is a finding.
select
  c.relname                as table_name,
  c.relrowsecurity         as rls_enabled,
  c.relforcerowsecurity    as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;

-- 2. Every policy, in full.
--    On `orders`, check the SELECT policy specifically: `user_id` is nullable for guest
--    checkout, and `using (user_id = auth.uid())` evaluates to NULL — not false — on those
--    rows. That is safe on its own, but an `or` branch added later can expose guest orders.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual        as using_expression,
  with_check  as with_check_expression
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 3. Tables with RLS on but no policy at all — these deny everything to anon/authenticated,
--    which silently reads as "empty" in the app (see the swallowed-error finding).
select c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname
  );

-- 4. Confirm the purchase-count RPC exists and is what checkout expects.
--    `app/checkout/actions.ts` now logs when this call errors, but the function should be here.
select
  p.proname       as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef     as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'increment_product_purchase_counts';
