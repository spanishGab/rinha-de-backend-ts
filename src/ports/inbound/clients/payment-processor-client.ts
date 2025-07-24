import { UUID } from 'crypto';

export type PaymentServerHealthResponseBody = {
  failing: boolean;
  minResponseTime: number;
}

export type PaymentRequestBody = {
    correlationId: UUID;
    amount: number;
    requestedAt: string;
}

export type PaymentResponseBody = {
    message: string;
}

export interface IPaymentProcessorClient {
    checkHealth(): Promise<PaymentServerHealthResponseBody>;
    processPayment(requestBody: PaymentRequestBody): Promise<PaymentResponseBody>;
}
