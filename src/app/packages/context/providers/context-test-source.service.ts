import { Client, SearchResponse } from 'elasticsearch';
import { Observable } from 'rxjs/Observable';
import { Context, ContextCriteria, BaseContextSourceProvider } from '@ansyn/context/context.interface';
import { IContextConfig, ContextConfig } from '@ansyn/context';
import { Inject } from '@angular/core';
import 'rxjs/add/observable/fromPromise';

export interface ITestContextConfig {
	uri: string;
}

export class ContextTestSourceService extends BaseContextSourceProvider {
	config: ITestContextConfig;

	constructor(@Inject(ContextConfig)config: IContextConfig) {
		super(config, 'test');
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
