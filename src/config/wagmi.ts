import { http, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID - get one at https://cloud.walletconnect.com
// NOTE: Must be a UUID v4-ish string. If invalid, we disable WalletConnect to avoid runtime errors.
const projectId = 'web3-jobs-institute';
const isValidWalletConnectProjectId = /^[0-9a-fA-F-]{36}$/.test(projectId);

export const config = createConfig({
  // Prevent picking up Phantom (EVM) / other injected providers when user wants MetaMask.
  // (Keeps multi-chain overall: ETH via MetaMask/WalletConnect, SOL via Phantom adapter.)
  multiInjectedProviderDiscovery: false,
  chains: [mainnet, polygon, arbitrum, optimism, base],
  connectors: [
    injected({ target: 'metaMask' }),
    ...(isValidWalletConnectProjectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
