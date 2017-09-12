import { Injector, Injectable } from '@angular/core';
import { GenericTypeResolver, InjectionResolverFilter, Type } from './generic-type-resolver';

@Injectable()
export class GenericTypeResolverService {
	constructor(private injector: Injector) {
	}

	resolveMultiInjection(token: Type, filterFunction: InjectionResolverFilter = null, isSingelton: boolean = false): any {
		return GenericTypeResolver.resolveMultiInjection(this.injector, token, filterFunction, isSingelton);
	}
}
