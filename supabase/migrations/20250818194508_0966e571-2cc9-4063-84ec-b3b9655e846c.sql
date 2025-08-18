-- Remove overly permissive RLS policies that expose all company data
DROP POLICY IF EXISTS "authenticated_users_can_view_companies" ON public.companies;
DROP POLICY IF EXISTS "authenticated_users_can_update_companies" ON public.companies;

-- The existing restrictive policies will remain:
-- "Allow company selection" - only allows users to view their own company
-- "Allow company update by admin" - only allows admins to update their own company
-- "Allow company creation" - allows authenticated users to create companies (needed for signup)