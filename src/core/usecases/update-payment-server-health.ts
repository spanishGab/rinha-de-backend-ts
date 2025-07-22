export type ServerType = 'default' | 'fallback';

export type PaymentServerHealth = {
    server: ServerType;
    failing: boolean
    minResponseTime: number;
}

export interface IUpdatePaymentServerHealthUseCase {
    execute(server: ServerType): Promise<PaymentServerHealth>;
}
