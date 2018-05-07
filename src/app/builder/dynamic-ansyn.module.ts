import { ComponentFactoryResolver, Injectable, InjectionToken } from '@angular/core';
import { AnsynApi } from './ansyn-api.service';

export const BOOTSTRAP_COMPONENTS_TOKEN = new InjectionToken('bootstrap_components');


@Injectable()
export class DynamicsAnsynModule {

	constructor(public api: AnsynApi,
				private resolver: ComponentFactoryResolver) {
	}

	// ngDoBootstrap(appRef: ApplicationRef) {
	// 		const factory = this.resolver.resolveComponentFactory(AnsynComponent);
	// 		// factory.selector = componentDef.selector;
	// 		appRef.bootstrap(factory);
	// }
}
