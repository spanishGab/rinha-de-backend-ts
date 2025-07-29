export type PaymentRequestsRecord = {
    id?: string;
    correlationId: string;
    amount: string;
    isProcessed: boolean;
    createdAt?: string;
}

export interface IPaymentRequestsRepository {
    upsert(paymentRequest: PaymentRequestsRecord): Promise<void>;
}
