// TODO: What is this doing here -Amit
export * from './context.config.interface';

export abstract class BaseContextSourceProvider {
	config: any;

	abstract find(ContextCriteria);

	abstract remove(id);

	abstract create(Context);

	abstract update(id, Context);
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
