export type RegisterPayload = {
  businessName: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};

export type AuthResponse = {
  access_token: string;
};
