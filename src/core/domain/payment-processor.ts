import { DateTime } from "luxon";
import { IPaymentProcessorClient, PaymentResponseBody } from "../../ports/inbound/clients/payment-processor-client";
import { Payment } from "./entities/payment";

export class PaymentProcessorStrategy {
    private strategy: IPaymentProcessorClient | null = null

    public choosePaymentProcessor(strategy: IPaymentProcessorClient) {
        this.strategy = strategy
    }

    public pay(payment: Payment): Promise<PaymentResponseBody> {
        if (this.strategy === null) {
            throw new Error("invalid strategy")
        }
        return this.strategy.processPayment({
            correlationId: payment.correlationId,
            amount: payment.amount.toNumber(),
            requestedAt: DateTime.now().toUTC().toISO()
        })
    }
}
