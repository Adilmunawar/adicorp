
-- Add foreign key relationships to activity_logs table
ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
