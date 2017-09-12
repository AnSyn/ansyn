import { ContextConfig } from './context.module';

export abstract class BaseContextSourceProvider {
	config: any;

	constructor(config: any, sourceName: string) {
		this.config = config[sourceName];
	}

	abstract find(ContextCriteria);

	abstract remove(id);

	abstract create(Context);

	abstract update(id, Context);

	abstract parseToSource(any);

	abstract parseFromSource(any);
}

export class ContextCriteria {
	start: number;
	limit: number;

	constructor(options: { start, limit }) {
		this.start = options.start;
		this.limit = options.limit;
	}
}

export { Context } from '@ansyn/core';
