import { useState, useCallback } from 'react';
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
}

export const useWalletAuth = () => {
  const [state, setState] = useState<WalletAuthState>({
    isConnecting: false,
    isSigningMessage: false,
    error: null,
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
    wallet: solanaWallet,
    select: selectSolanaWallet,
    wallets: solanaWallets,
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

        // If we got a redirect URL, use it to complete auth
        if (data.redirectUrl) {
          // Extract the token from the URL and use it
          const url = new URL(data.redirectUrl);
          const token = url.searchParams.get('token') || url.hash.replace('#access_token=', '').split('&')[0];
          
          if (token) {
            // Verify the token with Supabase
            const { error } = await supabase.auth.verifyOtp({
              token_hash: data.token,
              type: 'magiclink',
            });
            
            if (error) {
              // Try alternative approach - refresh the session
              console.log('Magic link verification failed, trying session refresh');
            }
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
        const connector = connectors.find((c) => c.id === connectorType) || connectors[0];
        
        if (!connector) {
          throw new Error('No wallet connector available');
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
        window.location.reload();

        return authResult;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to connect Ethereum wallet';
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

  const connectSolanaWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Find Phantom wallet
      const phantomWallet = solanaWallets.find((w) => w.adapter.name === 'Phantom');
      
      if (phantomWallet) {
        selectSolanaWallet(phantomWallet.adapter.name);
        await connectSolana();
      } else {
        // Try any available wallet
        if (solanaWallets.length > 0) {
          selectSolanaWallet(solanaWallets[0].adapter.name);
          await connectSolana();
        } else {
          throw new Error('No Solana wallet found. Please install Phantom.');
        }
      }

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!solanaPublicKey) {
        throw new Error('Failed to get Solana public key');
      }

      const address = solanaPublicKey.toBase58();

      setState((prev) => ({ ...prev, isConnecting: false, isSigningMessage: true }));

      // Generate and sign message
      const message = generateAuthMessage(address);
      const encodedMessage = new TextEncoder().encode(message);
      
      if (!signSolanaMessage) {
        throw new Error('Wallet does not support message signing');
      }

      const signatureBytes = await signSolanaMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      // Authenticate with backend
      const authResult = await authenticateWithWallet(address, signature, message, 'solana');

      setState((prev) => ({ ...prev, isSigningMessage: false }));

      toast({
        title: authResult.isNewUser ? 'Welcome!' : 'Welcome back!',
        description: `Connected with ${address.slice(0, 4)}...${address.slice(-4)}`,
      });

      // Reload to get the new session
      window.location.reload();

      return authResult;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect Solana wallet';
      setState((prev) => ({ ...prev, isConnecting: false, isSigningMessage: false, error: errorMessage }));
      
      toast({
        title: 'Connection failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [
    solanaWallets,
    selectSolanaWallet,
    connectSolana,
    solanaPublicKey,
    signSolanaMessage,
    generateAuthMessage,
    authenticateWithWallet,
    toast,
  ]);

  const disconnect = useCallback(async () => {
    try {
      if (isEthConnected) {
        await disconnectEth();
      }
      if (isSolanaConnected) {
        await disconnectSolana();
      }
      await supabase.auth.signOut();
      window.location.reload();
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
    
    // Solana
    solanaAddress: solanaPublicKey?.toBase58(),
    isSolanaConnected,
    connectSolanaWallet,
    
    // Common
    disconnect,
  };
};
