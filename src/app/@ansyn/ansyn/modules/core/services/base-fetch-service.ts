
export abstract class BaseFetchService {
	abstract fetch(url: string, options?: RequestInit): Promise<Response>;
}

