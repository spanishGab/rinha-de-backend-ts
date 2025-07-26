export interface IQueueClient {
    enqueue<T>(message: T): Promise<void>;
    deleteMessage(messageId: string): Promise<void>;
}
