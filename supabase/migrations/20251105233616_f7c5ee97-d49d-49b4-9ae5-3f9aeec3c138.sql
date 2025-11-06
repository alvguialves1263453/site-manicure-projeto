-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Enable realtime for services table
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;

-- Enable realtime for gallery table
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery;