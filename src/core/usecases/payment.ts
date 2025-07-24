import { Payment } from "../domain/entities/payment";

export interface IPaymentUseCase {
    execute(payment: Payment): Promise<boolean>
}
