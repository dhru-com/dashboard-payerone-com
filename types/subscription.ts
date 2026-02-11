export interface SubscriptionV2 {
  package: string;
  billing_cycle?: 'monthly' | 'annually';
  start_date: string | null;
  end_date: string | null;
  status: string;
  wallet_balance: number;
  auto_renew: boolean;
}

export interface PlanPricing {
  monthly: number;
  annually: number;
}

export interface PlanFeeItem {
  fixed: number;
  percent: number;
  label?: string;
}

export interface PlanFees {
  default: PlanFeeItem;
  gateways: Record<string, PlanFeeItem>;
}

export interface SubscriptionPlan {
  name: string;
  short_description: string;
  full_description: string;
  features: string[];
  pricing: PlanPricing;
  fees: PlanFees;
  badge?: string;
  popular?: boolean;
}

export interface WalletPackage {
  name: string;
  amount: number;
  credits: number;
  description: string;
  badge?: string;
}

export interface SubscriptionResponse {
  current_subscription: SubscriptionV2;
  subscription_plans: Record<string, SubscriptionPlan>;
  wallet_packages: Record<string, WalletPackage>;
}

export interface InvoiceRequest {
  preview: boolean;
  order_type: 'SUBSCRIPTION' | 'WALLET_TOPUP';
  product_id: string;
  billing_cycle?: 'monthly' | 'annually';
  auto_renew?: boolean;
  use_wallet?: boolean;
}

export interface InvoicePreviewData {
  plan_name: string;
  billing_cycle: string;
  amount: number;
  credit_applied: number;
  final_amount: number;
  purchase_type: string;
  current_plan: string;
  can_use_wallet: boolean;
}

export interface InvoicePurchaseData {
  order_url: string;
  order_id: string;
}

export interface InvoiceV2 {
  invoice_uuid: string;
  invoice_no: string;
  status: string;
  created_at: string;
}

export interface InvoiceItemV2 {
  tax: number;
  total: number;
  amount: number;
  credit: number;
  description: string;
}

export interface InvoiceMetadataV2 {
  old_plan: string;
  auto_renew: boolean;
  description: string;
  purchase_type: string;
  credit_applied: number;
  original_amount: number;
}

export interface InvoiceDetailsV2 {
  invoice_uuid: string;
  invoice_no: string;
  order_type: string;
  product_id: string;
  billing_cycle: string;
  amount: number;
  credits: number;
  currency: string;
  status: string;
  payment_order_id: string | null;
  invoice_items: InvoiceItemV2[];
  metadata: InvoiceMetadataV2;
  created_at: string;
  paid_at: string | null;
  description: string;
}
