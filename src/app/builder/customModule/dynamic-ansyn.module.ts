import { ComponentFactoryResolver, Injectable, InjectionToken } from '@angular/core';
import { AnsynApi } from '../ansyn-api.service';
import { Store } from '@ngrx/store';
import { selectLoading } from '@ansyn/overlays/reducers/overlays.reducer';

export const BOOTSTRAP_COMPONENTS_TOKEN = new InjectionToken('bootstrap_components');


@Injectable()
export class DynamicsAnsynModule {

	constructor(public api: AnsynApi) {
	}


}
