import { useState, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type WalletType = 'ethereum' | 'solana';

interface WalletAuthState {
  isConnecting: boolean;
  isSigningMessage: boolean;
  error: string | null;
  pendingSolanaAuth: boolean;
}

export const useWalletAuth = () => {
  const [state, setState] = useState<WalletAuthState>({
    isConnecting: false,
    isSigningMessage: false,
    error: null,
    pendingSolanaAuth: false,
  });

  const { toast } = useToast();

  // Ethereum hooks
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync: disconnectEth } = useDisconnect();
  const { signMessageAsync: signEthMessage } = useSignMessage();

  // Solana hooks
  const {
    publicKey: solanaPublicKey,
    connected: isSolanaConnected,
    connect: connectSolana,
    disconnect: disconnectSolana,
    signMessage: signSolanaMessage,
    select: selectSolanaWallet,
    wallet: selectedSolanaWallet,
  } = useWallet();

  const generateAuthMessage = useCallback((walletAddress: string) => {
    const timestamp = Date.now();
    return `Welcome to Web3 Jobs Institute!

Sign this message to verify your wallet ownership.

Wallet: ${walletAddress}
Timestamp: ${timestamp}

This signature does not trigger any blockchain transactions or cost any gas fees.`;
  }, []);

  const authenticateWithWallet = useCallback(
    async (walletAddress: string, signature: string, message: string, walletType: WalletType) => {
      try {
        const response = await fetch(
          `https://chmddvsbvhmwhfbvzlwt.supabase.co/functions/v1/wallet-auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress,
              signature,
              message,
              walletType,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        // Use the magic link token to sign in
        if (data.hashedToken && data.email) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: data.hashedToken,
            type: 'magiclink',
          });
          
          if (error) {
            console.error('Magic link verification failed:', error);
            // If verification fails, try to redirect to the action link
            if (data.actionLink) {
              window.location.href = data.actionLink;
              return data;
            }
            throw new Error('Failed to complete authentication');
          }
        }

        return data;
      } catch (error) {
        console.error('Wallet auth error:', error);
        throw error;
      }
    },
    []
  );

  const connectEthereum = useCallback(
    async (connectorType: 'injected' | 'walletConnect' = 'injected') => {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        const connector = connectors.find((c) => c.id === connectorType);
        
        if (!connector) {
          if (connectorType === 'walletConnect') {
            throw new Error('WalletConnect is not configured yet. Please add a valid WalletConnect Project ID.');
          }
          throw new Error('MetaMask connector not available. Please install MetaMask (or disable Phantom EVM mode).');
        }

        const result = await connectAsync({ connector });
        const address = result.accounts[0];

        if (!address) {
          throw new Error('No address returned from wallet');
        }

        setState((prev) => ({ ...prev, isConnecting: false, isSigningMessage: true }));

        // Generate and sign message
        const message = generateAuthMessage(address);
        const signature = await signEthMessage({ account: address as `0x${string}`, message });

        // Authenticate with backend
        const authResult = await authenticateWithWallet(address, signature, message, 'ethereum');

        setState((prev) => ({ ...prev, isSigningMessage: false }));

        toast({
          title: authResult.isNewUser ? 'Welcome!' : 'Welcome back!',
          description: `Connected with ${address.slice(0, 6)}...${address.slice(-4)}`,
        });

        // Reload to get the new session
        window.location.href = '/dashboard';

        return authResult;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect Ethereum wallet';
        setState((prev) => ({ ...prev, isConnecting: false, isSigningMessage: false, error: errorMessage }));
        
        toast({
          title: 'Connection failed',
          description: errorMessage,
          variant: 'destructive',
        });
        
        throw error;
      }
    },
    [connectors, connectAsync, signEthMessage, generateAuthMessage, authenticateWithWallet, toast]
  );

  // Complete Solana auth when wallet is connected and we have a pending auth
  useEffect(() => {
    const completeSolanaAuth = async () => {
      if (!state.pendingSolanaAuth || !isSolanaConnected || !solanaPublicKey || !signSolanaMessage) {
        return;
      }

      setState((prev) => ({ ...prev, pendingSolanaAuth: false, isConnecting: false, isSigningMessage: true }));

      try {
        const address = solanaPublicKey.toBase58();

        // Generate and sign message
        const message = generateAuthMessage(address);
        const encodedMessage = new TextEncoder().encode(message);
        
        const signatureBytes = await signSolanaMessage(encodedMessage);
        const signature = bs58.encode(signatureBytes);

        // Authenticate with backend
        const authResult = await authenticateWithWallet(address, signature, message, 'solana');

        setState((prev) => ({ ...prev, isSigningMessage: false }));

        toast({
          title: authResult.isNewUser ? 'Welcome!' : 'Welcome back!',
          description: `Connected with ${address.slice(0, 4)}...${address.slice(-4)}`,
        });

        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to sign message';
        setState((prev) => ({ ...prev, isSigningMessage: false, error: errorMessage }));
        
        toast({
          title: 'Authentication failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };

    completeSolanaAuth();
  }, [state.pendingSolanaAuth, isSolanaConnected, solanaPublicKey, signSolanaMessage, generateAuthMessage, authenticateWithWallet, toast]);

  const connectSolanaWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // First, select Phantom wallet explicitly
      selectSolanaWallet('Phantom' as any);
      
      // Mark that we're waiting for connection to complete
      setState((prev) => ({ ...prev, pendingSolanaAuth: true }));

      // Trigger connect - this will prompt the Phantom popup
      await connectSolana();

      // The useEffect above will handle the rest when connection completes
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Solana wallet';
      setState((prev) => ({ ...prev, isConnecting: false, pendingSolanaAuth: false, error: errorMessage }));
      
      // Check if it's the Ethereum/Solana conflict error
      if (errorMessage.includes('Ethereum') || errorMessage.includes('unsupported')) {
        toast({
          title: 'Wallet conflict detected',
          description: 'Please make sure Phantom is set to Solana mode, not Ethereum mode. You can change this in Phantom settings.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Connection failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      throw error;
    }
  }, [selectSolanaWallet, connectSolana, toast]);

  const disconnect = useCallback(async () => {
    try {
      if (isEthConnected) {
        await disconnectEth();
      }
      if (isSolanaConnected) {
        await disconnectSolana();
      }
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [isEthConnected, isSolanaConnected, disconnectEth, disconnectSolana]);

  return {
    // State
    isConnecting: state.isConnecting,
    isSigningMessage: state.isSigningMessage,
    error: state.error,
    
    // Ethereum
    ethAddress,
    isEthConnected,
    connectEthereum,
    hasWalletConnect: connectors.some((c) => c.id === 'walletConnect'),
    
    // Solana
    solanaAddress: solanaPublicKey?.toBase58(),
    isSolanaConnected,
    connectSolanaWallet,
    selectedSolanaWallet,
    
    // Common
    disconnect,
  };
};