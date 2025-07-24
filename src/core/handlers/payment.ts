import { UUID } from "crypto";
import { IEventHandler } from "../../ports/inbound/event-handler";
import { Payment } from "../domain/entities/payment";
import { IPaymentUseCase } from "../usecases/payment";
import Big from "big.js";
import { info } from "../../shared/logger";

type PaymentRequestBody = {
    correlationId: UUID
    amount: number
}

export class IPaymentHandler implements IEventHandler<PaymentRequestBody, boolean> {
    constructor(
        private paymentUseCase: IPaymentUseCase,
    ){}

    async handle(input: PaymentRequestBody): Promise<boolean> {
        info(`starting to process payment ${JSON.stringify(input)}`)
        const result = await this.paymentUseCase.execute({
            correlationId: input.correlationId,
            amount: new Big(input.amount),
        })
        return result
    }
}

