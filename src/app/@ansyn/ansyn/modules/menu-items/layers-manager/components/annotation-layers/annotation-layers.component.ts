import { Component } from '@angular/core';
import { LayerCollectionComponent } from '../layers-collection/layer-collection.component';
import { ILayer, LayerType } from '../../models/layers.model';
import { map } from 'rxjs/operators';
import { SetActiveAnnotationLayer } from '../../actions/layers.actions';
import { SetSubMenu } from '../../../../status-bar/components/tools/actions/tools.actions';
import { SubMenuEnum } from '../../../../status-bar/components/tools/models/tools.model';

@Component({
	selector: 'ansyn-annotation-layers',
	templateUrl: './annotation-layers.component.html',
	styleUrls: ['./annotation-layers.component.less']
})
export class AnnotationLayersComponent extends LayerCollectionComponent{
	type = LayerType.annotation;

	disabledRemove = this.getLayers$.pipe(
		map( (layers: ILayer[]) => layers.length < 2)
	);

	openLayersTools(id: string) {
		this.store$.dispatch(new SetActiveAnnotationLayer(id));
		this.store$.dispatch(new SetSubMenu(SubMenuEnum.annotations));
	}
}
