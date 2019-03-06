import { BaseFetchService } from './base-fetch-service';

export class FetchService implements BaseFetchService {
	fetch(url: RequestInfo, options?: RequestInit): Promise<Response> {
		return window.fetch(url, options);
	}}
