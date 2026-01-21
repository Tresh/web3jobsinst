-- Add wallet address fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_type TEXT;

-- Create index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Add unique constraint on wallet_address (when not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_wallet_address_unique 
ON public.profiles(wallet_address) 
WHERE wallet_address IS NOT NULL;