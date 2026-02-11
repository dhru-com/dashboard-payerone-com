export interface Webhook {
  uuid: string;
  url: string;
  created_at: string;
}

export interface WebhookResponse {
  [key: string]: Webhook;
}

export interface CreateWebhookPayload {
  url: string;
}

export interface UpdateWebhookPayload {
  url: string;
}

export interface TestWebhookResponse {
  http_code: number;
}
