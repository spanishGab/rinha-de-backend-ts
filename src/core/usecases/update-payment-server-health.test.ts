import { mock } from 'node:test';
import { PaymentServerHealthResponseBody } from '../../ports/inbound/clients/payment-processor-client';
import { UpdatePaymentServerHealthUseCase, ServerType } from './update-payment-server-health';

describe("test UpdatePaymentServerHealthUseCase", () => {
    describe("with cache", () => {
        const useCaseParamMocks = {
            defaultServerClient: {
                checkHealth: jest.fn().mockResolvedValue({
                    failing: false,
                    minResponseTime: 3,
                }),
                processPayment: jest.fn(),
            },
            fallbackServerClient: {
                checkHealth: jest.fn().mockResolvedValue({
                    failing: false,
                    minResponseTime: 3,
                }),
                processPayment: jest.fn(),
            },
            cacheClient: {
                set: jest.fn(),
                get: jest.fn().mockResolvedValue({ failing: false, minResponseTime: 3 } as PaymentServerHealthResponseBody),
                delete: jest.fn(),
            }
        }
        test.each([
            {
                should: 'should return health for default server',
                serverType: 'default',
                ...useCaseParamMocks,
                expected: {
                    server: 'default',
                    failing: false,
                    minResponseTime: 3,
                }
            },
            {
                should: 'should return health for fallback server',
                serverType: 'fallback',
                ...useCaseParamMocks,
                expected: {
                    server: 'fallback',
                    failing: false,
                    minResponseTime: 3,
                }
            }
        ])("$should", async ({ should, serverType, defaultServerClient, fallbackServerClient, cacheClient, expected }) => {
            const useCase = new UpdatePaymentServerHealthUseCase(
                defaultServerClient,
                fallbackServerClient,
                cacheClient
            );
            const result = await useCase.execute(serverType as ServerType);
            expect(result).toStrictEqual(expected);
            expect(defaultServerClient.checkHealth).not.toHaveBeenCalled();
            expect(fallbackServerClient.checkHealth).not.toHaveBeenCalled();
            expect(cacheClient.get).toHaveBeenCalledWith(`${serverType}:health`);
        });
    })

    describe("without cache", () => {
        const useCaseParamMocks = {
            defaultServerClient: {
                checkHealth: jest.fn().mockResolvedValue({
                    failing: false,
                    minResponseTime: 3,
                }),
                processPayment: jest.fn(),
            },
            fallbackServerClient: {
                checkHealth: jest.fn().mockResolvedValue({
                    failing: false,
                    minResponseTime: 3,
                }),
                processPayment: jest.fn(),
            },
            cacheClient: {
                set: jest.fn(),
                get: jest.fn().mockResolvedValue(null),
                delete: jest.fn(),
            }
        }
        test.each([
            {
                should: 'should return health for default server',
                serverType: 'default',
                ...useCaseParamMocks,
                expected: {
                    server: 'default',
                    failing: false,
                    minResponseTime: 3,
                }
            },
            {
                should: 'should return health for fallback server',
                serverType: 'fallback',
                ...useCaseParamMocks,
                expected: {
                    server: 'fallback',
                    failing: false,
                    minResponseTime: 3,
                }
            }
        ])("$should", async ({ should, serverType, defaultServerClient, fallbackServerClient, cacheClient, expected }) => {
            const useCase = new UpdatePaymentServerHealthUseCase(
                defaultServerClient,
                fallbackServerClient,
                cacheClient
            );
            const result = await useCase.execute(serverType as ServerType);
            expect(result).toStrictEqual(expected);
            if (serverType === 'default') {
                expect(defaultServerClient.checkHealth).toHaveBeenCalled();
                expect(fallbackServerClient.checkHealth).not.toHaveBeenCalled();
            } else {
                expect(defaultServerClient.checkHealth).not.toHaveBeenCalled();
                expect(fallbackServerClient.checkHealth).toHaveBeenCalled();
            }
            expect(cacheClient.get).toHaveBeenCalledWith(`${serverType}:health`);
            expect(cacheClient.set).toHaveBeenCalledWith(
                `${serverType}:health`,
                expected,
                5
            );
        });
    })
});
