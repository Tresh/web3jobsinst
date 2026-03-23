-- Social tasks that admins can configure per product
CREATE TABLE public.product_social_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  platform text NOT NULL, -- 'x', 'youtube', 'tiktok', 'instagram', 'telegram'
  task_type text NOT NULL, -- 'follow', 'retweet', 'like', 'subscribe', 'join'
  target_url text NOT NULL,
  description text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User completions with proof links
CREATE TABLE public.product_social_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.product_social_tasks(id) ON DELETE CASCADE,
  proof_url text,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- RLS
ALTER TABLE public.product_social_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_social_completions ENABLE ROW LEVEL SECURITY;

-- Anyone can read social tasks (needed to show the gate UI)
CREATE POLICY "Anyone can read product social tasks"
  ON public.product_social_tasks FOR SELECT
  USING (true);

-- Admins can manage social tasks
CREATE POLICY "Admins can insert product social tasks"
  ON public.product_social_tasks FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product social tasks"
  ON public.product_social_tasks FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product social tasks"
  ON public.product_social_tasks FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can read their own completions
CREATE POLICY "Users can read own completions"
  ON public.product_social_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON public.product_social_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all completions
CREATE POLICY "Admins can read all completions"
  ON public.product_social_completions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));