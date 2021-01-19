import { Inject, Injectable } from '@angular/core';
import { COMPONENT_MODE, COMPONENT_VISIBILITY, ComponentVisibilityItems, IComponentVisiblity } from './component-mode';

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
		return items.some(this.get.bind(this));
	}

	isOneToolsActive(): boolean {
		return this.some([
			ComponentVisibilityItems.IMAGE_PROCESSING,
			ComponentVisibilityItems.GOTO,
			ComponentVisibilityItems.SHADOW_MOUSE,
			ComponentVisibilityItems.MEASURES,
			ComponentVisibilityItems.ANNOTATIONS,
			ComponentVisibilityItems.EXPORT
		])
	}
}
