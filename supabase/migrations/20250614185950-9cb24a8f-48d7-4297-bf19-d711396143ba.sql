-- Create monthly working days configuration table
CREATE TABLE public.monthly_working_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- stores YYYY-MM-01 format
  working_days_count INTEGER NOT NULL DEFAULT 22, -- total working days for the month
  daily_rate_divisor INTEGER NOT NULL DEFAULT 26, -- what to divide salary by for daily rate
  configuration JSONB NOT NULL DEFAULT '{}', -- stores specific date overrides
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, month)
);
-- Add RLS policies for monthly working days
ALTER TABLE public.monthly_working_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view company monthly working days" 
  ON public.monthly_working_days 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage company monthly working days" 
  ON public.monthly_working_days 
  FOR ALL 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );
-- Update events table to support off_day type
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS affects_attendance BOOLEAN NOT NULL DEFAULT false;
-- Add comment to clarify event types
COMMENT ON COLUMN public.events.type IS 'Event type: holiday, working_day, half_day, off_day';
COMMENT ON COLUMN public.events.affects_attendance IS 'Whether this event affects attendance marking';
-- Create company settings table for working days preferences
CREATE TABLE public.company_working_settings (
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE PRIMARY KEY,
  default_working_days_per_week INTEGER NOT NULL DEFAULT 5, -- 5 or 6 days
  default_working_days_per_month INTEGER NOT NULL DEFAULT 22, -- 22 or 26 days
  salary_divisor INTEGER NOT NULL DEFAULT 26, -- always 26 for daily rate calculation
  weekend_saturday BOOLEAN NOT NULL DEFAULT false, -- true if Saturday is working day
  weekend_sunday BOOLEAN NOT NULL DEFAULT true, -- true if Sunday is off day
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Add RLS policies for company working settings
ALTER TABLE public.company_working_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view company working settings" 
  ON public.company_working_settings 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage company working settings" 
  ON public.company_working_settings 
  FOR ALL 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );
-- Create function to get working days for a specific month
CREATE OR REPLACE FUNCTION public.get_working_days_for_month(
  target_company_id UUID,
  target_month DATE
) RETURNS TABLE(
  total_working_days INTEGER,
  daily_rate_divisor INTEGER,
  working_dates DATE[]
) LANGUAGE plpgsql AS $$
DECLARE
  company_settings RECORD;
  monthly_config RECORD;
  start_date DATE;
  end_date DATE;
  iter_date DATE; -- renamed from current_date to avoid conflict
  working_dates_array DATE[] := ARRAY[]::DATE[];
  day_of_week INTEGER;
  is_working_day BOOLEAN;
BEGIN
  -- Get company default settings
  SELECT * INTO company_settings 
  FROM public.company_working_settings 
  WHERE company_id = target_company_id;
  -- If no settings found, use defaults
  IF NOT FOUND THEN
    company_settings.default_working_days_per_month := 22;
    company_settings.salary_divisor := 26;
    company_settings.weekend_saturday := false;
    company_settings.weekend_sunday := true;
  END IF;  
  -- Get monthly configuration if exists
  SELECT * INTO monthly_config 
  FROM public.monthly_working_days 
  WHERE company_id = target_company_id AND month = DATE_TRUNC('month', target_month);
  
  -- Set return values
  IF FOUND THEN
    total_working_days := monthly_config.working_days_count;
    daily_rate_divisor := monthly_config.daily_rate_divisor;
  ELSE
    total_working_days := company_settings.default_working_days_per_month;
    daily_rate_divisor := company_settings.salary_divisor;
  END IF;
  
  -- Calculate working dates for the month
  start_date := DATE_TRUNC('month', target_month);
  end_date := (DATE_TRUNC('month', target_month) + INTERVAL '1 month - 1 day')::DATE;
  iter_date := start_date;
  
  WHILE iter_date <= end_date LOOP
    day_of_week := EXTRACT(DOW FROM iter_date); -- 0=Sunday, 6=Saturday
    is_working_day := true;
    
    -- Check if it's a weekend based on company settings
    IF day_of_week = 0 AND company_settings.weekend_sunday THEN
      is_working_day := false;
    END IF;
    
    IF day_of_week = 6 AND NOT company_settings.weekend_saturday THEN
      is_working_day := false;
    END IF;
    
    -- Check for events that affect attendance
    IF EXISTS (
      SELECT 1 FROM public.events 
      WHERE company_id = target_company_id 
      AND date = iter_date 
      AND affects_attendance = true 
      AND type IN ('holiday', 'off_day')
    ) THEN
      is_working_day := false;
    END IF;
    
    -- Add to working dates if it's a working day
    IF is_working_day THEN
      working_dates_array := array_append(working_dates_array, iter_date);
    END IF;
    
    iter_date := iter_date + 1;
  END LOOP;
  
  working_dates := working_dates_array;
  RETURN NEXT;
END;
$$;
