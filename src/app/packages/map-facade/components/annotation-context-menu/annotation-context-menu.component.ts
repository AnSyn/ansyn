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
	contextMenuWrapperStyle;

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	@HostListener('window:mousewheel') onMousewheel() {
		this.host.nativeElement.blur();
	}

	constructor(public store: Store<IMapState>, public mapEffect: MapEffects, public host: ElementRef) {

		this.mapEffect.annotationContextMenuTrigger$.subscribe((action: AnnotationContextMenuTriggerAction) => {
			this.action = action;
			const { pixels } = this.action.payload;
			this.contextMenuWrapperStyle = {
				top: `${pixels.top}px`,
				left: `${pixels.left}px`,
				width: `${pixels.width}px`,
				height: `${pixels.height}px`
			};

			this.host.nativeElement.focus();
		});
	}

	removeFeature($event) {
		$event.stopPropagation();
		const { featureId } = this.action.payload;
		this.store.dispatch(new AnnotationRemoveFeature(featureId));
	}
}
