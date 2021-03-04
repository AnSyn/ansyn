import { Component } from '@angular/core';
import { LayerCollectionComponent } from '../layers-collection/layer-collection.component';
import { LayerType } from '../../models/layers.model';

@Component({
	selector: 'ansyn-annotation-layers',
	templateUrl: './annotation-layers.component.html',
	styleUrls: ['./annotation-layers.component.less']
})
export class AnnotationLayersComponent extends LayerCollectionComponent{
	type = LayerType.annotation;
}
