export interface Transaction {
  id: number;
  userId: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'REFUND';
  amount: number;
  description: string;
  createdAt: string;
}

export interface WalletBalance {
  balance: number;
}

export interface DepositRequest {
  amount: number;
}

export interface DepositResponse {
  balance: number;
  transaction: Transaction;
}
