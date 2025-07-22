export type HTTPRequestOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: URL;
    headers?: Record<string, string>;
    body?: any;
}

export interface IHTTPClient {
    get<T>(options: HTTPRequestOptions): Promise<T>;
    post<T>(options: HTTPRequestOptions): Promise<T>;
}
