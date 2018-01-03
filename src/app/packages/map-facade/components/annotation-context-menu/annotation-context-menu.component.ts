import { Component, ElementRef, HostBinding, HostListener } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { AnnotationContextMenuTriggerAction, AnnotationRemoveFeature } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})
export class AnnotationContextMenuComponent {
	action: AnnotationContextMenuTriggerAction;

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	constructor(public store: Store<IMapState>, public mapEffect: MapEffects, public host: ElementRef) {

		this.mapEffect.annotationContextMenuTrigger$.subscribe((action: AnnotationContextMenuTriggerAction) => {
			this.action = action;
			const { pixels, geometryName } = this.action.payload;
			switch (geometryName.replace('Annotate-', '')) {
				case 'Box':
					pixels.top -= 2;
					pixels.height += 1;
					pixels.left -= 2;
					pixels.width += 2;
					break;
				case 'Point':
					pixels.top -= 12;
					pixels.height += 22;
					pixels.left -= 12;
					pixels.width += 22;
					break;

			}

			let styleString = `top:${pixels.top}px;left:${pixels.left}px;width:${pixels.width}px;height:${pixels.height}px;`;
			this.host.nativeElement.setAttribute('style', styleString);
			this.host.nativeElement.focus();
		});
	}

	removeFeature() {
		const { featureId } = this.action.payload;
		this.store.dispatch(new AnnotationRemoveFeature(featureId));
		this.host.nativeElement.setAttribute('style', '');
	}
}
