import { BaseFetchService } from './base-fetch-service';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class FetchService implements BaseFetchService {
	fetch(url: RequestInfo, options?: RequestInit): Promise<Response> {
		return window.fetch(url, options);
	}}
