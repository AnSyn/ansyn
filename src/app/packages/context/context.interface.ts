export interface IContextSource {
	providerType: string;

	find(ContextCriteria): any;

	remove(id);

	create(Context);

	update(id, Context);

	parseToSource(any);

	parseFromSource(any);
}


export interface IContextSourceConfig {
	type: string;
	uri: string;
	bucket: string;
	available: boolean;
	log?: string;
	auth?: string;
	apiObject: string;

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
