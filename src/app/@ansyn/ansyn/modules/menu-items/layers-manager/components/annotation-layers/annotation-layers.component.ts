import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayerCollectionComponent } from '../layers-collection/layer-collection.component';
import { ILayer, LayerType } from '../../models/layers.model';
import { map, tap } from 'rxjs/operators';
import { SetActiveAnnotationLayer } from '../../actions/layers.actions';
import { SetSubMenu } from '../../../../status-bar/components/tools/actions/tools.actions';
import { SubMenuEnum } from '../../../../status-bar/components/tools/models/tools.model';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { SetToastMessageAction } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-annotation-layers',
	templateUrl: './annotation-layers.component.html',
	styleUrls: ['./annotation-layers.component.less']
})
@AutoSubscriptions()
export class AnnotationLayersComponent extends LayerCollectionComponent implements OnInit, OnDestroy{
	annotationLayerExceedLimit: boolean;
	type = LayerType.annotation;


	disabledRemove$ = this.getLayers$.pipe(
		map( (layers: ILayer[]) => layers.length < 2)
	);

	@AutoSubscription
	annotationLayersCount$ = this.getLayers$.pipe(
		map( (layers: ILayer[]) => layers.length ),
		tap( count => {
			this.annotationLayerExceedLimit = count >= this.config.limit
		})
	);

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	openLayersTools(id: string) {
		this.store$.dispatch(new SetActiveAnnotationLayer(id));
		this.store$.dispatch(new SetSubMenu(SubMenuEnum.annotations));
	}

	notifyIfAddLayerNotAllowed() {
		if (this.annotationLayerExceedLimit) {
			this.store$.dispatch(new SetToastMessageAction({toastText: this.config.limitError}))
		}
	}
}
