import { ContextCriteria, Context, ContextProviderService } from '../context.interface';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';

export class ContextProxySource extends ContextProviderService {
	public providerType: string;
	public uri;
	public headers = new Headers({'Content-Type': 'application/json'});
	public options = new RequestOptions();

	constructor(private http: Http) {
		super();
		this.uri = `${this.config.uri}${this.config.bucket}`;
		this.providerType = config.type;
		this.options.headers = this.headers;
	}


	find(criteria: ContextCriteria) {
		return this.http.get(this.uri.concat('/', criteria.start, '/', criteria.limit))
			.map(res => this.parseFromSource(res.json() || {}))
			.catch(this.handleError);
	}

	remove(id): any {
		return this.http.delete(this.uri + '/' + id);
	}

	create(payload: Context) {
		return this.http.post(this.uri, this.parseToSource(payload), this.options)
		// .map(res =>  this.parseFromSource(res.json() || {}))
			.catch(this.handleError);
	}

	update(id, payload: Context) {
		return this.http.put(this.uri + '/' + id, this.parseToSource(payload), this.options)
		// .map(res =>  this.parseFromSource(res.json() || {}))
			.catch(this.handleError);
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

	private handleError(error: Response | any) {
		// In a real world app, you might use a remote logging infrastructure
		let errMsg: string;
		if (error instanceof Response) {
			const body = error.json() || '';
			const err = (<any>body).error || JSON.stringify(body);
			errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
		} else {
			errMsg = error.message ? error.message : error.toString();
		}
		console.error(errMsg);
		return Observable.throw(errMsg);
	}


}
