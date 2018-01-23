import { BaseContextSourceProvider, Context, ContextConfig, ContextCriteria, IContextConfig } from '@ansyn/context';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';
import { ErrorHandlerService } from '@ansyn/core';

export interface IProxySource {
	uri: string;
	log: string;
	bucket: string;
}

@Injectable()
export class ContextProxySourceService extends BaseContextSourceProvider {
	config: IProxySource;

	uri: string;

	constructor(@Inject(ContextConfig)config: IContextConfig, protected http: HttpClient, @Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService) {
		super();
		this.config = <IProxySource>config.proxy;

		this.uri = `${this.config.uri}${this.config.bucket}`;
	}

	find(criteria: ContextCriteria) {
		return this.http.get(this.uri.concat('/', String(criteria.start), '/', String(criteria.limit)))
			.map(res => this.parseFromSource(res))
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}

	remove(id): any {
		return this.http.delete(this.uri + '/' + id);
	}

	create(payload: Context) {
		return this.http.post(this.uri, this.parseToSource(payload))
		// .map(res =>  this.parseFromSource(res.json() || {}))
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}

	update(id, payload: Context) {
		return this.http.put(this.uri + '/' + id, this.parseToSource(payload))
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}

	parseToSource(data): any {
		return data;
	}

	parseFromSource(data): Context[] {
		return data.hits.hits.map((contextElastic: any): Context => {
			let context: any = {};
			context.id = contextElastic._id;
			Object.keys(contextElastic._source).forEach((key) => {
				context[key] = contextElastic._source[key];
			});
			return context;
		});
	}

}
