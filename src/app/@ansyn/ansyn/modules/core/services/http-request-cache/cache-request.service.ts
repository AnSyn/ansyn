import { Injectable, Inject } from '@angular/core';
import { CacheService } from '@ansyn/imagery';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { CoreConfig, ICoreConfig } from '../../../../public_api';

interface ICached {
	response: HttpResponse<any>
	ttl: number;
}
const ttl = 5 * (1000 * 60); // 5 minutes;
@Injectable()
export class CacheRequestService {
	cache = new Map();
	get cacheBlackList(): string[] {
		return this.coreConfig.httpCacheBlackList;
	}
	constructor(@Inject(CoreConfig) private coreConfig: ICoreConfig) {
	}

	get(req: HttpRequest<any>): HttpResponse<any> | undefined {
		const key = this.getKeyFromRequest(req);
		const cached = this.cache.get(key);

		if (!cached) {
			return undefined
		}
		cached.ttl = Date.now();
		this.cache.set(key, cached);
		return cached.response;
	}

	set(req: HttpRequest<any>, response: HttpResponse<any>) {
		if (this.cacheBlackList.some( url => req.urlWithParams.includes(url))) {
			const key = this.getKeyFromRequest(req);
			const entry = { key, response, ttl: Date.now() };
			this.cache.set(key, entry);

			const expired = Date.now() - ttl;
			this.cache.forEach(expiredEntry => {
				if (expiredEntry.ttl < expired) {
					this.cache.delete(expiredEntry.key)
				}
			})
		}
	}


	private getKeyFromRequest(req: HttpRequest<any>): string {
		return `${req.method}/${req.urlWithParams}/${req.body ? JSON.stringify(req.body) : ''}`
	}
}
