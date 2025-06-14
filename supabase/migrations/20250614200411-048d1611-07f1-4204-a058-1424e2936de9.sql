
-- Update the events table type constraint to allow all event types used in the application
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_type_check;

-- Add a new constraint that includes all the event types used in the AdvancedEventManager
ALTER TABLE public.events ADD CONSTRAINT events_type_check 
  CHECK (type IN ('holiday', 'working_day', 'half_day', 'off_day', 'meeting', 'training'));
