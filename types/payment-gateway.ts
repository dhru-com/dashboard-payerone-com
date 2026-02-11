/**
 * @deprecated Legacy Payment Gateway V1 types.
 * Use V2 types in /types/payment-gateway-v2.ts for future development.
 */
export interface PaymentGatewayConfigField {
  name: string;
  type: "string" | "enum" | "float" | "checkbox" | "qr_reader";
  required: boolean;
  description?: string;
  enum_options?: string[];
}

export interface PaymentGatewayMetadata {
  name: string;
  description: string;
  config: Record<string, PaymentGatewayConfigField>;
}

export interface Visibility {
  enabled: boolean;
  date_start?: string;
  date_end?: string;
  days_of_week?: number[];
  time_start?: string;
  time_end?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface ActivatedGateway {
  type: string;
  config: Record<string, unknown>;
  visibility?: Visibility;
}

export interface PaymentGatewayData {
  activated_gateways: Record<string, ActivatedGateway>;
}

export interface PaymentGatewayInfo {
  metadata: {
    payment_gateways: Record<string, PaymentGatewayMetadata>;
  };
}

export interface PaymentGatewayResponse {
  status: string;
  message: string;
  code: number;
  data: PaymentGatewayData;
  info: PaymentGatewayInfo;
}
