
-- Create activity_logs table for tracking system changes
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_activity_logs_company_id ON public.activity_logs(company_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to view logs from their company
CREATE POLICY "Users can view activity logs from their company"
  ON public.activity_logs
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Create RLS policy to allow users to insert activity logs for their company
CREATE POLICY "Users can create activity logs for their company"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );
