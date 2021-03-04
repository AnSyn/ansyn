import { Component } from '@angular/core';
import { LayerCollectionComponent } from '../layers-collection/layer-collection.component';
import { LayerType } from '../../models/layers.model';

@Component({
	selector: 'ansyn-static-layers',
	templateUrl: './static-layers.component.html',
	styleUrls: ['./static-layers.component.less']
})
export class StaticLayersComponent extends LayerCollectionComponent{
	type = LayerType.static;


}
