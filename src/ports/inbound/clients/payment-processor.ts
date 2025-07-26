import { UUID } from 'crypto';

export type PaymentServerHealthResponseBody = {
  failing: boolean;
  minResponseTime: number;
}

export type PaymentRequest = {
    body: {
        correlationId: UUID;
        amount: number;
        requestedAt: string;
    }
}

export type PaymentResponse = {
    body: {
        message: string;
    }
}

export interface IPaymentProcessorClient {
    checkHealth(): Promise<PaymentServerHealthResponseBody>;
    processPayment(requestBody: PaymentRequest): Promise<PaymentResponse>;
}
