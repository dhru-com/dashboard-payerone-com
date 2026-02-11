export interface GatewayLimits {
  daily_total_amount?: number;
  daily_order_count?: number;
  monthly_total_amount?: number;
  monthly_order_count?: number;
  daily_amount_limit?: number;
  daily_order_limit?: number;
  monthly_amount_limit?: number;
}

export interface GatewayInventoryItem {
  uuid: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
  status: string;
  limits: GatewayLimits;
  is_standalone?: boolean;
  used_in_routers?: {
    id: string;
    label: string;
  }[];
}

export interface RouterVisibility {
  enabled: boolean;
  priority: number;
  timezone: string;
  date_start?: string;
  date_end?: string;
  days_of_week?: number[];
  time_start?: string;
  time_end?: string;
  countries_allow?: string[];
  countries_deny?: string[];
  currencies_allow?: string[];
  min_amount?: number;
  max_amount?: number;
  daily_amount_limit?: number;
  monthly_amount_limit?: number;
  daily_order_limit?: number;
}

export interface Router {
  uuid: string;
  label: string;
  strategy: 'round_robin' | 'priority' | 'weighted';
  mask_name: string;
  members: string[]; // Gateway UUIDs
  visibility: RouterVisibility;
  narration?: string;
}

export interface GatewayUsage {
  daily_order_count: number;
  daily_total_amount: number;
  monthly_order_count: number;
  monthly_total_amount: number;
}

export interface PaymentGatewayV2Metadata {
  inventory_config: Record<string, {
    name: string;
    description: string;
    config: Record<string, {
      name: string;
      type: string;
      required: boolean;
      description?: string;
      enum_options?: string[];
    }>;
  }>;
  visibility: Record<string, {
    enum_options?: string[];
    [key: string]: unknown;
  }>;
  router: Record<string, unknown>; // Schema for group structure
}

export interface PaymentGatewayV2Data {
  inventory: Record<string, GatewayInventoryItem>;
  routers: Record<string, Router>;
  usage: Record<string, GatewayUsage>;
}

export interface PaymentGatewayV2Info {
  metadata: PaymentGatewayV2Metadata;
}

export interface PaymentGatewayV2Response {
  status: string;
  message?: string;
  data: PaymentGatewayV2Data;
  info: PaymentGatewayV2Info;
}
