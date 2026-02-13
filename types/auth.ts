import { NetworkMetadata } from "@/lib/networks";
import { SubscriptionV2 } from "./subscription";

export interface User {
  clientid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  company_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  timezone?: string | null;
  language?: string;
  avatar_url?: string;
  branding?: {
    icon?: string;
    logo?: string;
    brand_colour?: string;
    accent_colour?: string;
  };
  currency?: string;
  subscription?: {
    package: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  subscription_v2?: SubscriptionV2;
  subscription_info?: string;
  payment_handle?: string | null;
  payment_gateways?: Record<string, { type: string; display_name: string }>;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  code: number;
  data: T;
  info?: {
    pagination?: {
      total_records: number;
      total_pages: number;
      current_page: number;
      limit: number;
    };
  };
}

export interface LoginInitResponse {
  profile: User;
  static: {
    networks: Record<string, NetworkMetadata>;
  };
}

export interface MerchantApiKeyData {
  authorization_token: string;
  private_key: string;
  sandbox?: boolean;
}

export interface NotificationPreferences {
  preferences: Record<string, Record<string, boolean>>;
  types: Record<string, string>;
  channels: Record<string, string>;
}
