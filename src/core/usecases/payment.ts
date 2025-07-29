import { IPaymentProcessorClient, PaymentResponse } from "../../ports/inbound/clients/payment-processor";
import { IPaymentRequestsRepository } from "../../ports/inbound/repositories/payment-requests";
import { error } from "../../shared/logger";
import { Payment } from "../domain/entities/payment";
import { PaymentProcessorDirector } from "../domain/payment-processor";
import { IUpdatePaymentServerHealthUseCase } from "./update-payment-server-health";

export interface IPaymentUseCase {
    execute(payment: Payment): Promise<boolean>
}

export class PaymentUseCase implements IPaymentUseCase {
    private readonly paymentProcessorDirector: PaymentProcessorDirector = new PaymentProcessorDirector();

    constructor(
        private readonly updatePaymentServerHealthUseCase: IUpdatePaymentServerHealthUseCase,
        private readonly defaultPaymentProcessorClient: IPaymentProcessorClient,
        private readonly fallbackPaymentProcessorClient: IPaymentProcessorClient,
        private readonly paymentRequestsRepository: IPaymentRequestsRepository,
    ) {}

    async execute(payment: Payment): Promise<boolean> {
        if (!(await this.choosePaymentProcessor())) {
            return false;
        }

        const paymentResponse: PaymentResponse = await this.paymentProcessorDirector.pay(payment)
        if (!paymentResponse.success) {
            error(new Error(`Payment failed: ${paymentResponse.message}`));
            return false;
        }
        await this.paymentRequestsRepository.create({
            correlationId: payment.correlationId,
            amount: payment.amount.toString(),
        });
        return true;

    }

    private async choosePaymentProcessor(): Promise<boolean> {
        const defaultServerHealth = await this.updatePaymentServerHealthUseCase.execute('default');
        if (!defaultServerHealth.failing) {
            this.paymentProcessorDirector.choosePaymentProcessor(this.defaultPaymentProcessorClient);
            return true;
        }

        const fallbackServerHealth = await this.updatePaymentServerHealthUseCase.execute('fallback');
        if (!fallbackServerHealth.failing) {
            this.paymentProcessorDirector.choosePaymentProcessor(this.fallbackPaymentProcessorClient);
            return true;
        }
        return false;
    }
}
