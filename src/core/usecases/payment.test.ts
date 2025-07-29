import { randomUUID } from "crypto"
import { IPaymentProcessorClient } from "../../ports/inbound/clients/payment-processor"
import { IPaymentRequestsRepository } from "../../ports/inbound/repositories/payment-requests"
import { IUpdatePaymentServerHealthUseCase, PaymentServerHealth, ServerType } from "./update-payment-server-health"
import { PaymentUseCase } from "./payment"
import Big from "big.js"

describe("test PaymentUseCasee", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('success cases', () => {
        it('should return true when payment is processed by default server', async () => {
            const payment = {
                correlationId: randomUUID(),
                amount: new Big(100),
            }
            const defaultServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn().mockResolvedValue({ success: true, message: 'Payment Processed!' }),
            } as IPaymentProcessorClient
            const fallbackServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn(),
            } as IPaymentProcessorClient
            const paymentRequestsRepository = {
                upsert: jest.fn(),
            } as IPaymentRequestsRepository
            const updatePaymentServerHealthUseCase = {
                execute: jest.fn().mockResolvedValue({ failing: false, minResponseTime: 3 }),
            } as IUpdatePaymentServerHealthUseCase
            const expectedResult = true

            const paymentUeCase = new PaymentUseCase(
                updatePaymentServerHealthUseCase,
                defaultServerClient,
                fallbackServerClient,
                paymentRequestsRepository
            )
            const result = await paymentUeCase.execute(payment)
            expect(result).toBe(expectedResult)
            expect(updatePaymentServerHealthUseCase.execute).toHaveBeenNthCalledWith(1, 'default')
            expect(defaultServerClient.processPayment).toHaveBeenCalledTimes(1)
            expect(fallbackServerClient.processPayment).not.toHaveBeenCalled()
            expect(paymentRequestsRepository.upsert).toHaveBeenCalledTimes(2)
        })

        it('should return true when payment is processed by fallback server', async () => {
            const payment = {
                correlationId: randomUUID(),
                amount: new Big(100),
            }
            const defaultServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn(),
            } as IPaymentProcessorClient
            const fallbackServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn().mockResolvedValue({ success: true, message: 'Payment Processed!' }),
            } as IPaymentProcessorClient
            const paymentRequestsRepository = {
                upsert: jest.fn(),
            } as IPaymentRequestsRepository
            const updatePaymentServerHealthUseCase = {
                execute: jest.fn((server: ServerType) => {
                    if (server === 'default') {
                        return Promise.resolve({ failing: true, minResponseTime: 3 } as PaymentServerHealth);
                    }
                    return Promise.resolve({ failing: false, minResponseTime: 3 }  as PaymentServerHealth);
                })
            } as IUpdatePaymentServerHealthUseCase
            const expectedResult = true

            const paymentUeCase = new PaymentUseCase(
                updatePaymentServerHealthUseCase,
                defaultServerClient,
                fallbackServerClient,
                paymentRequestsRepository
            )
            const result = await paymentUeCase.execute(payment)
            expect(result).toBe(expectedResult)
            expect(updatePaymentServerHealthUseCase.execute).toHaveBeenCalledWith('default')
            expect(updatePaymentServerHealthUseCase.execute).toHaveBeenCalledWith('fallback')
            expect(defaultServerClient.processPayment).not.toHaveBeenCalledTimes(1)
            expect(fallbackServerClient.processPayment).toHaveBeenCalled()
            expect(paymentRequestsRepository.upsert).toHaveBeenCalledTimes(2)
        })
    })

    describe('failure cases', () => {
        it('should return false when no server is available to process payments', async () => {
            const payment = {
                correlationId: randomUUID(),
                amount: new Big(100),
            }
            const defaultServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn(),
            } as IPaymentProcessorClient
            const fallbackServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn(),
            } as IPaymentProcessorClient
            const paymentRequestsRepository = {
                upsert: jest.fn(),
            } as IPaymentRequestsRepository
            const updatePaymentServerHealthUseCase = {
                execute: jest.fn().mockResolvedValue({ failing: true, minResponseTime: 3 }),
            } as IUpdatePaymentServerHealthUseCase
            const expectedResult = false

            const paymentUeCase = new PaymentUseCase(
                updatePaymentServerHealthUseCase,
                defaultServerClient,
                fallbackServerClient,
                paymentRequestsRepository
            )
            const result = await paymentUeCase.execute(payment)
            expect(result).toBe(expectedResult)
            expect(updatePaymentServerHealthUseCase.execute).toHaveBeenCalledWith('default')
            expect(updatePaymentServerHealthUseCase.execute).toHaveBeenCalledWith('fallback')
            expect(defaultServerClient.processPayment).not.toHaveBeenCalledTimes(1)
            expect(fallbackServerClient.processPayment).not.toHaveBeenCalled()
            expect(paymentRequestsRepository.upsert).toHaveBeenCalledTimes(1)
        })

        it('should return false when the chosen payment server fails to process the requested payment', async () => {
            const payment = {
                correlationId: randomUUID(),
                amount: new Big(100),
            }
            const defaultServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn().mockResolvedValue({ success: false, message: 'Server Unavailable' }),
            } as IPaymentProcessorClient
            const fallbackServerClient = {
                checkHealth: jest.fn(),
                processPayment: jest.fn(),
            } as IPaymentProcessorClient
            const paymentRequestsRepository = {
                upsert: jest.fn(),
            } as IPaymentRequestsRepository
            const updatePaymentServerHealthUseCase = {
                execute: jest.fn().mockResolvedValue({ failing: false, minResponseTime: 3 }),
            } as IUpdatePaymentServerHealthUseCase
            const expectedResult = false

            const paymentUeCase = new PaymentUseCase(
                updatePaymentServerHealthUseCase,
                defaultServerClient,
                fallbackServerClient,
                paymentRequestsRepository
            )
            const result = await paymentUeCase.execute(payment)
            expect(result).toBe(expectedResult)
            expect(updatePaymentServerHealthUseCase.execute).toHaveBeenNthCalledWith(1, 'default')
            expect(defaultServerClient.processPayment).toHaveBeenCalledTimes(1)
            expect(fallbackServerClient.processPayment).not.toHaveBeenCalled()
            expect(paymentRequestsRepository.upsert).toHaveBeenCalledTimes(1)
        })
    })
})
