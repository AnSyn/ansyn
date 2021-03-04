import { Component } from '@angular/core';
import { LayerCollectionComponent } from '../layers-collection/layer-collection.component';
import { LayerType, ILayer } from '../../models/layers.model';
import { SelectedModalEnum } from '../../reducers/layers-modal';
import { SetLayersModal } from '../../actions/layers.actions';

@Component({
	selector: 'ansyn-annotation-layers',
	templateUrl: './annotation-layers.component.html',
	styleUrls: ['./annotation-layers.component.less']
})
export class AnnotationLayersComponent extends LayerCollectionComponent{
	type = LayerType.annotation;
}
