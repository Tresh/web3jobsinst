
-- Products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'tools',
  price integer NOT NULL DEFAULT 0, -- in kobo (NGN lowest denomination)
  currency text NOT NULL DEFAULT 'NGN',
  image_url text,
  creator_name text NOT NULL DEFAULT 'Web3 Jobs',
  creator_user_id uuid,
  download_url text,
  downloads_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  coming_soon boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Product orders table
CREATE TABLE public.product_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  email text NOT NULL,
  amount integer NOT NULL, -- in kobo
  currency text NOT NULL DEFAULT 'NGN',
  paystack_reference text UNIQUE,
  paystack_transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Products RLS: Anyone can view published products
CREATE POLICY "Anyone can view published products"
  ON public.products FOR SELECT
  USING (is_published = true);

-- Products RLS: Admins full CRUD
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Orders RLS: Users can insert orders
CREATE POLICY "Users can insert own orders"
  ON public.product_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Orders RLS: Users can view own orders
CREATE POLICY "Users can view own orders"
  ON public.product_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders RLS: Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.product_orders FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Orders RLS: Admins can update orders
CREATE POLICY "Admins can update all orders"
  ON public.product_orders FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role policy for webhook updates
CREATE POLICY "Service role can update orders"
  ON public.product_orders FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can update products"
  ON public.products FOR UPDATE
  TO service_role
  USING (true);

-- Updated_at triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_orders_updated_at
  BEFORE UPDATE ON public.product_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial products from existing static data
INSERT INTO public.products (title, description, category, price, image_url, creator_name, downloads_count, coming_soon, is_published) VALUES
  ('Crypto YouTube Automation Guide', 'Complete guide to automating your crypto YouTube channel with AI tools and workflows.', 'ebooks', 2900000, '/placeholder.svg', 'Web3 Academy', 245, true, true),
  ('Telegram Trading Bot Access', 'Get access to our premium trading signals bot with real-time alerts and analytics.', 'bots', 4900000, '/placeholder.svg', 'DeFi Signals', 512, true, true),
  ('NFT Launch Checklist', 'Free comprehensive checklist for launching your NFT collection successfully.', 'materials', 0, '/placeholder.svg', 'NFT Pro', 1203, true, true),
  ('AI Content Writer Tool', 'AI-powered tool for generating Web3 content, threads, and marketing copy.', 'tools', 1900000, '/placeholder.svg', 'ContentAI', 389, true, true),
  ('Smart Contract Templates', 'Ready-to-deploy smart contract templates for common use cases.', 'templates', 0, '/placeholder.svg', 'DevDAO', 876, true, true),
  ('DeFi Trading Strategies Ebook', 'Advanced trading strategies for DeFi protocols and yield farming.', 'ebooks', 3900000, '/placeholder.svg', 'Yield Master', 654, true, true),
  ('Community Management Bot', 'Automate your Discord and Telegram community management.', 'bots', 2900000, '/placeholder.svg', 'ModBot Labs', 423, true, true),
  ('Tokenomics Calculator', 'Free tool to design and visualize your token economics.', 'tools', 0, '/placeholder.svg', 'Token Studio', 1567, true, true);
