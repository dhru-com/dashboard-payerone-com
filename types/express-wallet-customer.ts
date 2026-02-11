export interface ExpressWalletCustomerAddress {
  address: string;
  network: string;
}

export interface ExpressWalletCustomer {
  merchant_client_id: string;
  merchant_client_email: string;
  merchant_client_name: string;
  last_activity: string;
  addresses: ExpressWalletCustomerAddress[];
  website: string;
}
