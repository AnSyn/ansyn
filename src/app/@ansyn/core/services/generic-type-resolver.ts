import { cloneDeep } from 'lodash';
export type InjectionResolverFilter = (resolvedClasses: any[]) => any;

export interface IResolver {
	get: (any) => any;
}

export type Type = Function;

export class GenericTypeResolver {
	static resolveMultiInjection(injector: IResolver, token: Type, filterFunction: InjectionResolverFilter = null, isSingelton: boolean = false): any {
		const resolvedValue = injector.get(token);

		if (!Array.isArray(resolvedValue) || filterFunction === null) {
			return isSingelton ? resolvedValue : cloneDeep(resolvedValue);
		} else {
			return isSingelton ? filterFunction(resolvedValue) : cloneDeep(filterFunction(resolvedValue));
		}
	}

}
