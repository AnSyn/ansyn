import { Inject, Injectable } from '@angular/core';
import { COMPONENT_MODE, COMPONENT_VISIBILITY, ComponentVisibilityItems, IComponentVisibility } from './component-mode';

@Injectable({
	providedIn: 'root'
})
export class ComponentVisibilityService {

	constructor(@Inject(COMPONENT_MODE) protected componentMode: boolean,
				@Inject(COMPONENT_VISIBILITY) protected isVisibility: IComponentVisibility) {
	}



	get(componentName: keyof IComponentVisibility): boolean {
		if (this.componentMode) {
			return this.isVisibility[componentName];
		}

		return true;
	}

	some(items: Array<keyof IComponentVisibility>): boolean {
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
