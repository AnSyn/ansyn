import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { CoreConfig } from '../../models/core.config';
import { ICoreConfig } from '../../models/core.config.model';


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
		const key = this.getKeyFromRequest(req);
		if (!this.cacheBlackList.some(url => key.includes(url))) {
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
		return `${ req.method }/${ req.urlWithParams }/${ req.body ? JSON.stringify(req.body) : '' }`
	}
}
