import { DateTime } from "luxon";
import { IPaymentProcessorClient, PaymentResponse } from "../../ports/inbound/clients/payment-processor";
import { Payment } from "./entities/payment";

export class PaymentProcessorStrategy {
    private strategy: IPaymentProcessorClient | null = null

    public choosePaymentProcessor(strategy: IPaymentProcessorClient) {
        this.strategy = strategy
    }

    public pay(payment: Payment): Promise<PaymentResponse> {
        if (this.strategy === null) {
            throw new Error("invalid strategy")
        }
        return this.strategy.processPayment({
            body: {
                correlationId: payment.correlationId,
                amount: payment.amount.toNumber(),
                requestedAt: DateTime.now().toUTC().toISO()
            }
        })
    }
}
