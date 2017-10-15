import { Component, ElementRef, HostBinding } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { AnnotationData } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})
export class AnnotationContextMenuComponent {
	public feature;
	public action;
	public pixels;

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	constructor(public store: Store<IMapState>, public mapEffect: MapEffects, public host: ElementRef) {
		this.mapEffect.annotationContextMenuTrigger$.subscribe(({ payload }) => {
			this.feature = payload.feature;
			this.pixels = payload.pixels;
			this.host.nativeElement.setAttribute('style', `top: ${this.pixels.top}px;left:${this.pixels.left}px`);
			this.host.nativeElement.focus();
		});
	}

	removeFeature() {
		this.store.dispatch(new AnnotationData({
			feature: this.feature,
			action: "remove"
		}))
	}
}
