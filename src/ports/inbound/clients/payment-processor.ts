import { UUID } from 'crypto';

export type PaymentServerHealthResponseBody = {
  failing: boolean;
  minResponseTime: number;
}

export type PaymentRequest = {
    correlationId: UUID;
    amount: number;
    requestedAt: string;
}

export type PaymentResponse = {
    success: boolean;
    message?: string;
}

export interface IPaymentProcessorClient {
    checkHealth(): Promise<PaymentServerHealthResponseBody>;
    processPayment(requestBody: PaymentRequest): Promise<PaymentResponse>;
}
