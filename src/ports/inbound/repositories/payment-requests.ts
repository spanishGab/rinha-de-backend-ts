export type PaymentRequestsRecord = {
    id?: string;
    correlationId: string;
    amount: string;
    createdAt?: string;
}

export interface IPaymentRequestsRepository {
    create(paymentRequest: PaymentRequestsRecord): Promise<void>;
}
