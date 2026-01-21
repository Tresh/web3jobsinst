import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';

interface WalletAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletAuthDialog = ({ open, onOpenChange }: WalletAuthDialogProps) => {
  const [selectedChain, setSelectedChain] = useState<'ethereum' | 'solana' | null>(null);
  const {
    isConnecting,
    isSigningMessage,
    connectEthereum,
    connectSolanaWallet,
  } = useWalletAuth();

  const isLoading = isConnecting || isSigningMessage;

  const handleEthereumConnect = async (type: 'injected' | 'walletConnect') => {
    setSelectedChain('ethereum');
    try {
      await connectEthereum(type);
      onOpenChange(false);
    } catch {
      // Error already handled in hook
    }
  };

  const handleSolanaConnect = async () => {
    setSelectedChain('solana');
    try {
      await connectSolanaWallet();
      onOpenChange(false);
    } catch {
      // Error already handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to sign in securely
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ethereum Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Ethereum</h3>
            
            {/* MetaMask / Browser Wallet */}
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-3"
              onClick={() => handleEthereumConnect('injected')}
              disabled={isLoading}
            >
              {isLoading && selectedChain === 'ethereum' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 35 33" fill="none">
                  <path d="M17.5 0L0 12.5L6.5 33H28.5L35 12.5L17.5 0Z" fill="#F6851B"/>
                  <path d="M17.5 0L0 12.5L6.5 33H17.5V0Z" fill="#E2761B"/>
                  <path d="M17.5 0L35 12.5L28.5 33H17.5V0Z" fill="#CD6116"/>
                </svg>
              )}
              <div className="text-left">
                <div className="font-medium">MetaMask</div>
                <div className="text-xs text-muted-foreground">Browser extension</div>
              </div>
            </Button>

            {/* WalletConnect */}
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-3"
              onClick={() => handleEthereumConnect('walletConnect')}
              disabled={isLoading}
            >
              {isLoading && selectedChain === 'ethereum' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#3B99FC"/>
                  <path d="M10.5 12.5C13.5 9.5 18.5 9.5 21.5 12.5L22 13L24 11C19.5 6.5 12.5 6.5 8 11L10 13L10.5 12.5Z" fill="white"/>
                  <path d="M25 14L23.5 15.5C23.5 15.5 23.5 15.5 23.5 15.5L16 23L8.5 15.5L7 14L5 16L6.5 17.5L16 27L25.5 17.5L27 16L25 14Z" fill="white"/>
                </svg>
              )}
              <div className="text-left">
                <div className="font-medium">WalletConnect</div>
                <div className="text-xs text-muted-foreground">Mobile & desktop wallets</div>
              </div>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Solana Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Solana</h3>
            
            {/* Phantom */}
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-3"
              onClick={handleSolanaConnect}
              disabled={isLoading}
            >
              {isLoading && selectedChain === 'solana' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 128 128" fill="none">
                  <circle cx="64" cy="64" r="64" fill="url(#phantom-gradient)"/>
                  <path d="M110.5 64C110.5 89.7 89.7 110.5 64 110.5C38.3 110.5 17.5 89.7 17.5 64C17.5 38.3 38.3 17.5 64 17.5C89.7 17.5 110.5 38.3 110.5 64Z" fill="url(#phantom-inner)"/>
                  <ellipse cx="47" cy="58" rx="8" ry="12" fill="white"/>
                  <ellipse cx="81" cy="58" rx="8" ry="12" fill="white"/>
                  <defs>
                    <linearGradient id="phantom-gradient" x1="0" y1="0" x2="128" y2="128">
                      <stop stopColor="#534BB1"/>
                      <stop offset="1" stopColor="#551BF9"/>
                    </linearGradient>
                    <linearGradient id="phantom-inner" x1="17.5" y1="17.5" x2="110.5" y2="110.5">
                      <stop stopColor="#AB9FF2"/>
                      <stop offset="1" stopColor="#7C69E5"/>
                    </linearGradient>
                  </defs>
                </svg>
              )}
              <div className="text-left">
                <div className="font-medium">Phantom</div>
                <div className="text-xs text-muted-foreground">Solana wallet</div>
              </div>
            </Button>
          </div>
        </div>

        {isSigningMessage && (
          <div className="text-center text-sm text-muted-foreground pb-4">
            Please sign the message in your wallet to verify ownership...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
