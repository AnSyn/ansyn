import { Injectable } from '@angular/core';
import { CacheService } from '@ansyn/imagery';
import { HttpRequest, HttpResponse } from '@angular/common/http';

interface ICached {
	response: HttpResponse<any>
	ttl: number;
}
const ttl = 5 * (1000 * 60); // 5 minutes;
@Injectable()
export class CacheRequestService {
	cache = new Map();

	get(req: HttpRequest<any>): HttpResponse<any> | undefined {
		const key = req.urlWithParams + JSON.stringify(req.body);
		const cached = this.cache.get(key);

		if (!cached) {
			return undefined
		}
		cached.ttl = Date.now();
		this.cache.set(key, cached);
		return cached.response;
	}

	set(req: HttpRequest<any>, response: HttpResponse<any>) {
		const key = req.urlWithParams + JSON.stringify(req.body);
		const entry = { key, response, ttl: Date.now() };
		this.cache.set(key, entry);

		const expired = Date.now() - ttl;
		this.cache.forEach( expiredEntry => {
			if (expiredEntry.ttl < expired) {
				this.cache.delete(expiredEntry.key)
			}
		})

	}
}
