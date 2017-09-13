import { Client, SearchResponse } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Context, ContextCriteria, IContextSource, IContextSourceConfig } from '../context.interface';
import { logger } from 'codelyzer/util/logger';
import { Inject, Injectable } from '@angular/core';
import { ContextConfig } from '../context.module';

export class ContextElasticSource implements IContextSource {
	public uri;
	public bucket;
	public client: Client;
	providerType: string;


	constructor(config: IContextSourceConfig) {
		this.uri = config.uri;
		this.bucket = config.bucket;
		this.providerType = config.type;
		this.client = new Client({
			host: this.uri,
			log: config.log,
			httpAuth: config.auth
		});
	}

	ping() {
		this.client.ping({
			requestTimeout: 1000,
		}, error => {
			if (error) {
				console.error('elasticsearch cluster id donw!');
			} else {
				console.log('All is well');
			}
		});
	}

	find(criteria: ContextCriteria) {
		console.log('elastic provider');
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
