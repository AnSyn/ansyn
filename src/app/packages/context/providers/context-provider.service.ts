/**
 * Created by sadan on 04.07.2017.
 */

import { Injectable, Injector, ReflectiveInjector } from '@angular/core';
import { IContextSource, IContextSourceConfig } from '../context.interface';

@Injectable()
export class ContextProviderService {
	private container: Map<string, IContextSource>;

	constructor() {
		this.container = new Map<string, IContextSource>();
	}

	register(key: string, source: IContextSource) {
		if (!this.container.get(key)) {
			this.container.set(key, source);
		}
	}

	provide(key: string): IContextSource {
		const funcHandler =  this.container.get(key);
		return funcHandler ;
	}

	keys() {
		return Array.from(this.container.keys());
	}
}
