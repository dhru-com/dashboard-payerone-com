export interface ForwardingAddress {
  uuid: string;
  address: string;
  network: string[];
}

export interface ForwardingAddressPayload {
  address: string;
  network: string[];
}
