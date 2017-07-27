import { Injector, Injectable } from '@angular/core';
import { GenericTypeResolver, InjectionResolverFilter } from './generic-type-resolver';

@Injectable()
export class GenericTypeResolverService {
    constructor(private injector: Injector) { }

    resolveMultiInjection(token: any, filterFunction: InjectionResolverFilter, isSingelton: boolean): any {
        return GenericTypeResolver.resolveMultiInjection(this.injector, token, filterFunction, isSingelton);
    }
}
