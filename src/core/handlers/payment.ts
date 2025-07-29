import { UUID } from "crypto";
import { IEventHandler } from "../../ports/inbound/event-handler";
import { Payment } from "../domain/entities/payment";
import { IPaymentUseCase } from "../usecases/payment";
import Big from "big.js";
import { info } from "../../shared/logger";
import { IQueueClient } from "../../ports/outbound/queue";

type PaymentRequestBody = {
    correlationId: UUID
    amount: number
}

export class PaymentHandler implements IEventHandler<PaymentRequestBody, void> {
    constructor(
        private readonly paymentUseCase: IPaymentUseCase,
        private readonly paymentQueueClient: IQueueClient
    ){}

    async handle(input: PaymentRequestBody): Promise<void> {
        info(`starting to process payment ${JSON.stringify(input)}`)
        const payment: Payment = {
            correlationId: input.correlationId,
            amount: new Big(input.amount),
        }
        const paymentProcessed = await this.paymentUseCase.execute(payment)
        if (!paymentProcessed) {
            throw new Error(`Payment with correlationId ${input.correlationId} could not be processed`)
        }
    }
}

