-- Drop overly permissive policies that expose wage data to all company users
DROP POLICY IF EXISTS "Users can view company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can see employees in their company" ON public.employees;
DROP POLICY IF EXISTS "Users can manage company employees" ON public.employees;

-- Create admin-only policy for full employee data including wages
CREATE POLICY "Admins can view all employee data including wages" 
ON public.employees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.company_id = employees.company_id 
    AND profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Create policy for regular users to view basic employee info without wage data
CREATE POLICY "Users can view basic employee info without wages" 
ON public.employees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.company_id = employees.company_id 
    AND profiles.id = auth.uid()
    AND profiles.is_admin = false
  )
);

-- Admin-only policies for data modification
CREATE POLICY "Admins can insert employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.company_id = employees.company_id 
    AND profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update employees" 
ON public.employees 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.company_id = employees.company_id 
    AND profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete employees" 
ON public.employees 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.company_id = employees.company_id 
    AND profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);