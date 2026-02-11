export const NETWORK_METADATA = {
  "bsc": {
    "name": "Binance [BEP-20]",
    "type": "evm",
    "nativeSymbol": "BNB",
    "blockchain_url": "https://bscscan.com/tx/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "0x55d398326f99059fF775485246999027B3197955",
        "decimal": 18
      },
      "USDC": {
        "name": "USDC (USD Coin)",
        "address": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        "decimal": 18
      }
    },
    "chainId": 56,
    "trust_asset": "c20000714",
    "decimal": {
      "USDT": 18,
      "USDC": 18
    }
  },
  "polygon": {
    "name": "Polygon",
    "type": "evm",
    "nativeSymbol": "POL",
    "blockchain_url": "https://polygonscan.com/tx/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        "decimal": 6
      },
      "USDC": {
        "name": "USDC (USD Coin)",
        "address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        "decimal": 6
      }
    },
    "chainId": 137,
    "trust_asset": "c966"
  },
  "ethereum": {
    "name": "Ethereum [ERC-20]",
    "type": "evm",
    "nativeSymbol": "ETH",
    "blockchain_url": "https://etherscan.io/tx/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "decimal": 6
      },
      "USDC": {
        "name": "USDC (USD Coin)",
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimal": 6
      }
    },
    "chainId": 1,
    "trust_asset": "c60"
  },
  "opbnb": {
    "name": "opBNB",
    "type": "evm",
    "nativeSymbol": "BNB",
    "blockchain_url": "https://opbbscan.com/tx/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3",
        "decimal": 18
      }
    },
    "chainId": 204,
    "trust_asset": "c204",
    "decimal": {
      "USDT": 18
    }
  },
  "optimism": {
    "name": "OP Mainnet",
    "type": "evm",
    "nativeSymbol": "ETH",
    "blockchain_url": "https://optimistic.etherscan.io/tx/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        "decimal": 6
      },
      "USDC": {
        "name": "USDC (USD Coin)",
        "address": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        "decimal": 6
      }
    },
    "chainId": 10,
    "trust_asset": "c10000070"
  },
  "arbitrum": {
    "name": "Arbitrum One",
    "type": "evm",
    "nativeSymbol": "ETH",
    "blockchain_url": "https://arbiscan.io/tx/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        "decimal": 6
      },
      "USDC": {
        "name": "USDC (USD Coin)",
        "address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        "decimal": 6
      }
    },
    "chainId": 42161,
    "trust_asset": "c10042221"
  },
  "base": {
    "name": "Base",
    "type": "evm",
    "nativeSymbol": "ETH",
    "blockchain_url": "https://basescan.org/tx/",
    "tokens": {
      "USDC": {
        "name": "USDC (USD Coin)",
        "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "decimal": 6
      }
    },
    "chainId": 8453,
    "trust_asset": "c8453"
  },
  "solana": {
    "name": "Solana",
    "type": "solana",
    "nativeSymbol": "SOL",
    "blockchain_url": "https://solscan.io/tx/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        "decimal": 6
      },
      "USDC": {
        "name": "USDC (USD Coin)",
        "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "decimal": 6
      }
    },
    "trust_asset": "c501"
  },
  "tron": {
    "name": "Tron [TRC-20]",
    "type": "tron",
    "nativeSymbol": "TRX",
    "blockchain_url": "https://tronscan.org/#/transaction/",
    "tokens": {
      "USDT": {
        "name": "USDT (Tether USD)",
        "address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "decimal": 6
      }
    },
    "trust_asset": "c195"
  },
  "btc": {
    "name": "Bitcoin",
    "type": "btc",
    "nativeSymbol": "BTC",
    "blockchain_url": "https://www.blockchain.com/btc/tx/",
    "tokens": {
      "BTC": {
        "name": "Bitcoin",
        "address": "btc",
        "decimal": 8
      }
    },
    "trust_asset": "c0"
  }
} as const;

export type NetworkMetadata = {
  name: string;
  type: string;
  nativeSymbol: string;
  blockchain_url: string;
  tokens: Record<string, {
    name: string;
    address: string;
    decimal: number;
  }>;
  chainId?: number;
  trust_asset: string;
  decimal?: Record<string, number>;
};

export type NetworkKey = keyof typeof NETWORK_METADATA;
