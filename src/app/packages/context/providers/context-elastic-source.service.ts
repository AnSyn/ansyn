import { Client, SearchResponse } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Context, ContextCriteria, BaseContextSourceProvider } from '../context.interface';
import { IContextConfig } from '../context.module';

export interface IElasticSource {
	uri: string;
	log: string;
	auth: string;
}

export class ContextElasticSource extends BaseContextSourceProvider {
	client: Client;
	config: IElasticSource;

	constructor(config: IContextConfig) {
		super(config, 'elastic');

		this.client = new Client({
			host: this.config.uri,
			log: this.config.log,
			httpAuth: this.config.auth
		});
	}

	ping() {
		this.client.ping({ requestTimeout: 1000 }, error => {
			if (error) {
				console.error('elasticsearch cluster id donw!');
			} else {
				console.log('All is well');
			}
		});
	}

	find(criteria: ContextCriteria) {
		return Observable.fromPromise(this.client.search({
			index: 'context',
			type: 'context',
			size: criteria.limit,
			from: criteria.start
		})).map(result => this.parseFromSource(result));
	}

	remove(id) {
		return Observable.fromPromise(this.client.delete({
			index: 'context',
			type: 'context',
			id: id
		}));
	}

	create(payload: Context) {
		return Observable.fromPromise(this.client.create({
			index: 'context',
			type: 'context',
			id: btoa(new Date().getTime().toString()),
			body: this.parseToSource(payload)
		}));
	}

	update(id, payload: Context) {
		const doc = this.parseToSource(payload);
		return Observable.fromPromise(this.client.update({
			index: 'context',
			type: 'context',
			id: id,
			body: {
				doc
			}
		}));
	}

	parseToSource(data) {
		return data;
	}

	parseFromSource(data) {
		return data;
	}

}
