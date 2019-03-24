
export abstract class BaseFetchService {
	abstract fetch(url: RequestInfo, options?: RequestInit): Promise<Response>;
}

