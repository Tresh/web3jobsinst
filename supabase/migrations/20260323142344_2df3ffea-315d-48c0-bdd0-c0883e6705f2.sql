
-- Add viewer_url and allow_download to products table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS viewer_url text,
  ADD COLUMN IF NOT EXISTS allow_download boolean NOT NULL DEFAULT true;

-- Create product_access_logs table for tracking
CREATE TABLE public.product_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  action text NOT NULL DEFAULT 'view', -- 'view', 'download'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own logs
CREATE POLICY "Users can insert own access logs"
  ON public.product_access_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own logs
CREATE POLICY "Users can read own access logs"
  ON public.product_access_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all logs
CREATE POLICY "Admins can read all access logs"
  ON public.product_access_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
