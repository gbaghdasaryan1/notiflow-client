export type SendNotificationPayload = {
  templateId: string;
  customerId: string;
  data: Record<string, string>;
};

export type SendNotificationResponse = {
  id: string;
  status: string;
  channel: string;
  sentAt?: string;
};

export type BulkSendPayload = {
  templateId: string;
  customerIds: string[];
  data: Record<string, string>;
};

export type BulkSendResult = {
  customerId: string;
  status: string;
  error?: string;
};

export type BulkSendResponse = {
  success: boolean;
  results: BulkSendResult[];
};

export type FieldErrors = { template?: string; customers?: string };
