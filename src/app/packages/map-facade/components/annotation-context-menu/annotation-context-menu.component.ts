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
			switch (this.feature.geometryName_.replace('Annotate-', '')) {
				case 'Box':
					this.pixels.top -= 2;
					this.pixels.height += 1;
					this.pixels.left -= 2;
					this.pixels.width += 2;
					break;
				case 'Arrow':
					console.log(this.feature);
					const arrowDirection = this.pixels.height - this.pixels.width;
					// |||||||
					/*if ( arrowDirection > 0   ) {

					}
					// ----------
					else {

					}*/
					break;
				case 'Point':
					this.pixels.top -= 12;
					this.pixels.height += 22;
					this.pixels.left -= 12;
					this.pixels.width += 22;
					break;

			}

			let styleString = `top: ${this.pixels.top}px;left:${this.pixels.left}px;width: ${this.pixels.width}px;  height: ${this.pixels.height}px;`;
			this.host.nativeElement.setAttribute('style', styleString);
			this.host.nativeElement.focus();
		});
	}

	arrowExtent(line1, line2, line3) {

	}

	removeFeature() {
		this.store.dispatch(new AnnotationData({
			feature: this.feature,
			action: "remove"
		}))
	}
}
