export type InjectionResolverFilter = (resolvedClasses: any[]) => any;
export type Resolver = {
    get: (any) => any;
};

export class GenericTypeResolver {
    static resolveMultiInjection(injector: Resolver, token: any, filterFunction: InjectionResolverFilter = null, isSingelton: boolean = false): any {
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
