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
        const connector = connectors.find((c) => c.id === connectorType) || connectors[0];
        
        if (!connector) {
          throw new Error('No wallet connector available. Please install MetaMask.');
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

  const connectSolanaWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Find Phantom wallet
      const phantomWallet = solanaWallets.find((w) => w.adapter.name === 'Phantom');
      
      if (phantomWallet) {
        selectSolanaWallet(phantomWallet.adapter.name);
      } else if (solanaWallets.length > 0) {
        selectSolanaWallet(solanaWallets[0].adapter.name);
      } else {
        throw new Error('No Solana wallet found. Please install Phantom.');
      }

      await connectSolana();

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      // Redirect to dashboard
      window.location.href = '/dashboard';

      return authResult;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Solana wallet';
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
    
    // Solana
    solanaAddress: solanaPublicKey?.toBase58(),
    isSolanaConnected,
    connectSolanaWallet,
    
    // Common
    disconnect,
  };
};
