import { IPaymentProcessorClient, PaymentResponse } from "../../ports/inbound/clients/payment-processor";
import { IQueueClient } from "../../ports/outbound/queue";
import { error } from "../../shared/logger";
import { Payment } from "../domain/entities/payment";
import { PaymentProcessorStrategy } from "../domain/payment-processor";
import { IUpdatePaymentServerHealthUseCase, ServerType } from "./update-payment-server-health";

export interface IPaymentUseCase {
    execute(payment: Payment): Promise<boolean>
}

export class PaymentUseCase implements IPaymentUseCase {
    constructor(
        private readonly updatePaymentServerHealthUseCase: IUpdatePaymentServerHealthUseCase,
        private readonly defaultPaymentProcessorClient: IPaymentProcessorClient,
        private readonly fallbackPaymentProcessorClient: IPaymentProcessorClient,
    ) {}

    async execute(payment: Payment): Promise<boolean> {
        const paymentProcessorStrategy = new PaymentProcessorStrategy();
        switch (await this.choosePaymentProcessorServerType()) {
            case 'default':
                paymentProcessorStrategy.choosePaymentProcessor(this.defaultPaymentProcessorClient);
                break;
            case 'fallback':
                paymentProcessorStrategy.choosePaymentProcessor(this.fallbackPaymentProcessorClient);
                break;
            case null:
                return false;
        }

        let paymentResponse: PaymentResponse;
        try {
            paymentResponse = await paymentProcessorStrategy.pay(payment)
        } catch (e) {
            error(e as Error);
            return false;
        }



    }

    private async choosePaymentProcessorServerType(): Promise<ServerType | null> {
        const defaultServerHealth = await this.updatePaymentServerHealthUseCase.execute('default');
        if (defaultServerHealth.failing) {
            const fallbackServerHealth = await this.updatePaymentServerHealthUseCase.execute('fallback');
            if (fallbackServerHealth.failing) {
                return null;
            }
            return 'fallback';
        }
        return 'default';
    }
}
