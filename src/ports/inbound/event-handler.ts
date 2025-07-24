export interface IEventHandler<Input, Output> {
    handle(input: Input): Promise<Output>;
}
