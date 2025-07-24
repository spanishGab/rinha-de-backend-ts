import { IPaymentProcessorClient, PaymentServerHealthResponseBody } from "../../ports/inbound/clients/payment-processor-client";
import { ICacheClient } from "../../ports/outbound/cache";

export type ServerType = 'default' | 'fallback';

export type PaymentServerHealth = {
    server: ServerType;
    failing: boolean
    minResponseTime: number;
}

export interface IUpdatePaymentServerHealthUseCase {
    execute(server: ServerType): Promise<PaymentServerHealth>;
}

export class UpdatePaymentServerHealthUseCase implements IUpdatePaymentServerHealthUseCase {
    private static CACHE_TTL = 5; // seconds

    constructor(
        private readonly defaultPaymentProcessorClient: IPaymentProcessorClient,
        private readonly fallbackPaymentProcessorClient: IPaymentProcessorClient,
        private readonly cacheClient: ICacheClient,
    ) {}
    async execute(server: ServerType): Promise<PaymentServerHealth> {
        const client = server === 'default' ? this.defaultPaymentProcessorClient : this.fallbackPaymentProcessorClient;

        const currentHealthState = await this.cacheClient.get<PaymentServerHealthResponseBody>(`${server}:health`)
        if (currentHealthState !== null) {
            return { server: server, ...currentHealthState };
        }

        const healthState = await client.checkHealth();
        this.cacheClient.set<PaymentServerHealthResponseBody>(
            `${server}:health`,
            healthState,
            UpdatePaymentServerHealthUseCase.CACHE_TTL,
        );
        return { server: server, ...healthState };
    }
}
