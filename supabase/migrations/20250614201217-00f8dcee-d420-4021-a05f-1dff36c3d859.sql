
-- Add currency column to companies table
ALTER TABLE public.companies ADD COLUMN currency TEXT DEFAULT 'USD';
