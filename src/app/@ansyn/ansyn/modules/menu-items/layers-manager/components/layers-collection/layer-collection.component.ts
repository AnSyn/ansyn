import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import { SetLayersModal, ShowAllLayers } from '../../actions/layers.actions';
import { SelectedModalEnum } from '../../reducers/layers-modal';
import { ILayer, ILayersEntities, LayerType } from '../../models/layers.model';
import { ILayerState, selectLayers } from '../../reducers/layers.reducer';
import { IEntitiesTableData, ITableRowModel } from '../../../../core/models/IEntitiesTableModel';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs';
import { isEqual } from 'lodash';

@Component({
	selector: 'ansyn-layer-collection',
	template: ''
})
export class LayerCollectionComponent{
	type: LayerType;
	layersRowsData: ITableRowModel<ILayer>[] = [
		{
			headName: 'Layer name',
			propertyName: 'name'
		}
	];

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

	getLayers$ = this.store$.pipe(select(selectLayers));

	layers$ = this.getLayers$.pipe(
		map(this.filterLayer.bind(this)),
		distinctUntilChanged(isEqual),
		map(this.createTableEntities.bind(this))
	);
	constructor(public store$: Store) {
	}


	openModal(type: SelectedModalEnum, layer?: ILayer): void {
		this.store$.dispatch(new SetLayersModal({ type, layer }));
	}

	filterLayer(layers: ILayer[]): ILayer[] {
		return layers.filter(layer => layer.type === this.type);
	}
	private createTableEntities(layers: ILayer[]): IEntitiesTableData<ILayer> {
		const entitiesData: IEntitiesTableData<ILayer> = {ids: [], entities: {}};
		for (let layer of layers) {
			entitiesData.ids.push(layer.id);
			entitiesData.entities[layer.id] = layer;
		}
		return entitiesData
	}




}
