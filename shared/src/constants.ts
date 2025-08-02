export const LOTTERY_CONFIG = {
  TICKET_PRICE_USD: 1,
  PLATFORM_FEE_PERCENTAGE: 10, // 10%
  MAX_TICKETS_PER_LOTTERY: 10000,
  DRAW_FREQUENCY_DAYS: 7,
  MIN_TICKETS_FOR_DRAW: 10,
} as const;

export const VIP_LEVELS = {
  basic: { minSpent: 0, benefits: [] },
  silver: { minSpent: 50, benefits: ['5% discount', 'Early access'] },
  gold: { minSpent: 200, benefits: ['10% discount', 'Exclusive lotteries'] },
  platinum: { minSpent: 1000, benefits: ['15% discount', 'Personal support'] },
} as const;

export const SUPPORTED_NETWORKS = {
  solana: {
    name: 'Solana',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    programId: process.env.NEXT_PUBLIC_LOTTERY_PROGRAM_ID,
  },
} as const;

export const PAYMENT_PROVIDERS = {
  stripe: {
    name: 'Stripe',
    supportedMethods: ['card'],
    fees: 2.9,
  },
  transak: {
    name: 'Transak',
    supportedMethods: ['card', 'bank'],
    fees: 0.99,
  },
  moonpay: {
    name: 'MoonPay',
    supportedMethods: ['card', 'bank', 'apple_pay'],
    fees: 1.5,
  },
} as const;