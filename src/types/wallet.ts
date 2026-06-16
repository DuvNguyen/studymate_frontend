/**
 * Wallet & Transaction related types.
 */

export interface LedgerTransactionWallet {
  user_id?: number;
  user?: {
    profile?: {
      fullName?: string;
    };
  };
}

export interface LedgerTransaction {
  id: number;
  transaction_type: string;
  amount: number;
  status: string;
  balance_after?: number;
  created_at: string;
  wallet?: LedgerTransactionWallet;
  order_item?: {
    commission_rate?: number;
    order?: {
      student?: {
        profile?: {
          fullName?: string;
        };
      };
    };
    course?: {
      title?: string;
    };
  };
}

export interface LedgerStats {
  gross_revenue?: number;
  total_payouts?: number;
  total_commissions?: number;
}
