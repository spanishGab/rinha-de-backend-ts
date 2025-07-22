import { Payment } from "../entities/payment";

export interface IPaymentUseCase {
    execute(payment: Payment): Promise<boolean>
}
