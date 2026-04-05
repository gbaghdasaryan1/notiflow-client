export type TemplateChannel = 'email' | 'sms';

export type Template = {
  id: string;
  name: string;
  channel: TemplateChannel;
  content: string;
  variables: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTemplatePayload = {
  name: string;
  channel: TemplateChannel;
  content: string;
  variables: string[];
};

export type UpdateTemplatePayload = {
  name?: string;
  channel?: TemplateChannel;
  content?: string;
  variables?: string[];
};
