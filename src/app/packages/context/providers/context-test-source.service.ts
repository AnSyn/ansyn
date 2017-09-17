import { Client, SearchResponse } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import { BaseContextSourceProvider, Context, ContextCriteria } from '@ansyn/context/context.interface';
import { ContextConfig, IContextConfig } from '@ansyn/context';
import { Inject } from '@angular/core';
import 'rxjs/add/observable/fromPromise';

export interface ITestContextConfig {
	uri: string;
}

export class ContextTestSourceService extends BaseContextSourceProvider {
	config: ITestContextConfig;

	constructor(@Inject(ContextConfig)config: IContextConfig) {
		super();
		this.config = <ITestContextConfig>config.test;
	}

	find(criteria: ContextCriteria) {
		return Observable.from([]);
	}

	remove(id) {
		return Observable.from(null);
	}

	create(payload: Context) {
		return Observable.from(null);
	}

	update(id, payload: Context) {
		return Observable.from(null);
	}
}
