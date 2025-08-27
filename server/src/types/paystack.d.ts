declare module "paystack" {
  interface PaystackConfig {
    secretKey: string;
  }

  interface InitializeTransactionData {
    amount: number;
    email: string;
    reference: string;
    callback_url: string;
    metadata?: any;
    channels?: string[];
    currency?: string;
  }

  interface TransactionResponse {
    status: boolean;
    message: string;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }

  interface VerificationResponse {
    status: boolean;
    message: string;
    data: {
      id: number;
      domain: string;
      amount: number;
      currency: string;
      status: string;
      reference: string;
      receipt_number: string;
      message: string;
      gateway_response: string;
      channel: string;
      ip_address: string;
      fees: number;
      paid_at: string;
      metadata: any;
    };
  }

  interface PaystackInstance {
    transaction: {
      initialize(data: InitializeTransactionData): Promise<TransactionResponse>;
      verify(reference: string): Promise<VerificationResponse>;
    };
  }

  function Paystack(config: PaystackConfig): PaystackInstance;
  export = Paystack;
}
