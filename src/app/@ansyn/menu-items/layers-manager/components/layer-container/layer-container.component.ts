import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { layersStateSelector, ILayersState } from '../../reducers/layers.reducer';
import { Observable } from 'rxjs/Observable';
import { LayerMetadata } from '../../models/metadata/layer-metadata.interface';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
	selector: 'ansyn-layer-container',
	templateUrl: './layer-container.component.html',
	styleUrls: ['./layer-container.component.less'],
	animations: [
		trigger('rotateArrow', [
			state('true', style({
				transform: 'rotateZ(-45deg) translateY(35%) translateX(50%)'
			})),
			state('false', style({
				transform: 'rotateZ(135deg) translateY(-75%)'
			})),
			transition('1 <=> 0', animate('0.1s'))
		]),
		trigger('fieldsTrigger', [
			state('true', style({
				maxHeight: '5000px',
				opacity: 1
			})),
			state('false', style({
				maxHeight: '0',
				opacity: 0
			})),
			transition('1 <=> 0', animate('0.2s'))
		])
	]
})
export class LayerContainerComponent implements OnInit {

	public show = true;
	public metadataFromState: LayerMetadata;

	@Input() layer;
	@ViewChild('fields') fields: ElementRef;


	metadataFromState$: Observable<any> = this.store
		.select(layersStateSelector)
		.distinctUntilChanged()
		.map((state: ILayersState) => {
			return state.layers;
		});

	constructor(protected store: Store<ILayersState>) {
	}

	get disabledButton() {
		return !this.metadataFromState;
	}

	ngOnInit() {
		this.metadataFromState$.subscribe((layers) => {
			this.metadataFromState = cloneDeep(layers.get(this.layer));
		});
	}

	showAll(): void {
		if (this.metadataFromState) {
			const clonedMetadata: LayerMetadata = Object.assign(Object.create(this.metadataFromState), this.metadataFromState);
			clonedMetadata.showAll();
		}
	}
}
