import {
	LayerCollectionLoadedAction,
	LayersActionTypes,
	SelectLayerAction, UnselectLayerAction
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import { IAppState } from '../app.effects.module';
import { ContainerChangedTriggerAction } from '@ansyn/menu/actions/menu.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { LayersContainer } from '@ansyn/menu-items/layers-manager/models/layers.model';


@Injectable()
export class LayersAppEffects {
	/**
	 * @type Effect
	 * @name renderMaps$,
	 * @ofType SelectLayerAction, UnselectLayerAction
	 * @action ContainerChangedTriggerAction
	 */
	@Effect()
	redrawMaps$: Observable<any> = this.actions$
		.ofType<any>(LayersActionTypes.SELECT_LAYER, LayersActionTypes.UNSELECT_LAYER)
		.map(() => new ContainerChangedTriggerAction());

	/**
	 * @type Effect
	 * @name layerCollectionLoaded$,
	 * @ofType LayerCollectionLoadedAction
	 * @action SelectLayerAction?, UnselectLayerAction?
	 */
	@Effect()
	layerCollectionLoaded$: Observable<any> = this.actions$
		.ofType<any>(LayersActionTypes.LAYER_COLLECTION_LOADED)
		.mergeMap(() => this.dataLayersService.getAllLayersInATree())
		.withLatestFrom(this.store$.select(selectSelectedLayersIds))
		.mergeMap(([layersContainer, ids]: [LayersContainer[], string[]]) => {
			let results = [];
			layersContainer.forEach((layerCollection: any) => {
				if (ids.includes(layerCollection.id)) {
					results.push(new SelectLayerAction(layerCollection));
				} else {
					results.push(new UnselectLayerAction(layerCollection));
				}
			});
			return results;
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected dataLayersService: DataLayersService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
