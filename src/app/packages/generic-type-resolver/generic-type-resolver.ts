import { Injector } from '@angular/core';

export type injectionResolverFilter = (resolvedClasses: any[]) => any;

export class GenericTypeResolver {
    static resolveMultiInjection(injector: Injector, token: any, filterFunction: injectionResolverFilter, isSingelton: boolean = false): any {
        const resolvedValue = injector.get(token);

        if (!Array.isArray(resolvedValue)) {
            return isSingelton ? resolvedValue : this.cloneObject(resolvedValue);
        } else {
            return isSingelton ? filterFunction(resolvedValue) : this.cloneObject(filterFunction(resolvedValue));
        }
    }

    static cloneObject(object: Object): object {
        return Object.assign(Object.create(object), object);
    }
}
