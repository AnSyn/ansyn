import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import { SetLayerSelection, SetLayersModal, ShowAllLayers } from '../../actions/layers.actions';
import { SelectedModalEnum } from '../../reducers/layers-modal';
import { ILayer, ILayersEntities, LayerType } from '../../models/layers.model';
import { ILayerState, selectLayers, selectSelectedLayersIds } from '../../reducers/layers.reducer';
import { IEntitiesTableData, ITableRowModel } from '../../../../core/models/IEntitiesTableModel';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { map, distinctUntilChanged, tap, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { isEqual } from 'lodash';

@Component({
	selector: 'ansyn-layer-collection',
	template: ''
})
export class LayerCollectionComponent {
	type: LayerType;
	hoverLayer: string;
	layersRowsData: ITableRowModel<ILayer>[] = [
		{
			headName: 'Layer name',
			propertyName: 'name'
		}
	];

	selectedLayersIds$ = this.store$.pipe(
		select(selectSelectedLayersIds)
	);

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

	toggleLayer() {
		if ( this.hoverLayer) {
			this.selectedLayersIds$.pipe(
				take(1),
				map( (layers: string[]) => layers.includes(this.hoverLayer)),
				tap((isCheck) => this.store$.dispatch(new SetLayerSelection({id: this.hoverLayer, value: !isCheck})))
			).subscribe();
		}
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
