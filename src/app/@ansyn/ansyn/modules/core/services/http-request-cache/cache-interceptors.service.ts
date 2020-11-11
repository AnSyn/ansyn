import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CacheRequestService } from './cache-request.service';
import { tap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class CacheInterceptorsService implements HttpInterceptor {

	constructor(private cache: CacheRequestService) {
	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const cachedResponse = this.cache.get(req);
		return cachedResponse ? of(cachedResponse) : this.requestHandler(req, next);
	}

	requestHandler(req: HttpRequest<any>, next: HttpHandler) {
		return next.handle(req).pipe(
			tap(event => {
				if (event instanceof HttpResponse && event.status === 200) {
					this.cache.set(req, event);
				}
			})
		)
	}
}
