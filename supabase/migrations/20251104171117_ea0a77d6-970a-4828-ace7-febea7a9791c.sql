-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin users table (separate from auth for role management)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Services policies (public read, admin write)
CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can manage services"
  ON public.services FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Appointments policies (public create, admin manage)
CREATE POLICY "Anyone can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their appointments by phone"
  ON public.appointments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage all appointments"
  ON public.appointments FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Gallery policies (public read, admin write)
CREATE POLICY "Anyone can view gallery"
  ON public.gallery FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage gallery"
  ON public.gallery FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admin users policies
CREATE POLICY "Authenticated users can view admin users"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery' AND
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

CREATE POLICY "Authenticated users can delete gallery images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery' AND
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointments updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default services
INSERT INTO public.services (name, description, duration_minutes, price) VALUES
  ('Manicure Completa', 'Manicure com esmaltação, hidratação e acabamento perfeito', 60, 50.00),
  ('Pedicure Completa', 'Pedicure com esmaltação, hidratação e cuidados especiais', 90, 60.00),
  ('Manicure + Pedicure', 'Combo completo de cuidados para mãos e pés', 120, 100.00),
  ('Esmaltação em Gel', 'Esmaltação em gel de longa duração', 45, 70.00),
  ('Alongamento de Unhas', 'Alongamento com técnica profissional', 120, 150.00),
  ('Unhas Decoradas', 'Arte e decoração personalizada', 90, 80.00)
ON CONFLICT DO NOTHING;