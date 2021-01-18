import { Injectable, Inject } from '@angular/core';
import { COMPONENT_MODE, COMPONENT_VISIBILITY, IComponentVisiblity } from './component-mode';

@Injectable({
	providedIn: 'root'
})
export class ComponentVisibilityService {

	constructor(@Inject(COMPONENT_MODE) protected componentMode: boolean,
				@Inject(COMPONENT_VISIBILITY) protected isVisibility: IComponentVisiblity) {
	}



	get(componentName: keyof IComponentVisiblity): boolean {
		if (this.componentMode) {
			return this.isVisibility[componentName];
		}

		return true;
	}

	some(items: Array<keyof IComponentVisiblity>): boolean {
		if (this.componentMode) {
			return items.some(this.get.bind(this));
		}
		return true;
	}
}
