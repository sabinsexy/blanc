declare global {
  interface Window {
    phantom?: {
      ethereum?: unknown;
    };
    ethereum?: {
      isMetaMask?: boolean;
    };
  }
}

export {};