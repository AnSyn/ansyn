import { Component, OnInit } from '@angular/core';
import { LayerCollectionComponent } from '../layers-collection/layer-collection.component';
import { selectBaseLayers } from '../../reducers/layers.reducer';
import { select } from '@ngrx/store';
import { LayerType } from '../../models/layers.model';

@Component({
	selector: 'ansyn-base-layers',
	templateUrl: './base-layers.component.html',
	styleUrls: ['./base-layers.component.less']
})
export class BaseLayersComponent extends LayerCollectionComponent {
	type = LayerType.base;
}

