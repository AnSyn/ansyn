export type InjectionResolverFilter = (resolvedClasses: any[]) => any;

export interface Resolver {
	get: (any) => any;
}

export type Type = Function;

export class GenericTypeResolver {
	static resolveMultiInjection(injector: Resolver, token: Type, filterFunction: InjectionResolverFilter = null, isSingelton: boolean = false): any {
		const resolvedValue = injector.get(token);

		if (!Array.isArray(resolvedValue) || filterFunction === null) {
			return isSingelton ? resolvedValue : this.cloneObject(resolvedValue);
		} else {
			return isSingelton ? filterFunction(resolvedValue) : this.cloneObject(filterFunction(resolvedValue));
		}
	}

	static cloneObject(object: Object): object {
		return Object.assign(Object.create(object), object);
	}
}
