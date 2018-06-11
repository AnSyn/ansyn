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
		.mergeMap((action: any) => {
			let results = [];
			action.payload.forEach((layerCollection: any) => {
				if (layerCollection.isChecked) {
					results.push(new SelectLayerAction(layerCollection));
				} else {
					results.push(new UnselectLayerAction(layerCollection));
				}
			});
			return results;
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
