import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SetLayerSelection, SetLayersModal } from '../../actions/layers.actions';
import { SelectedModalEnum } from '../../reducers/layers-modal';
import { ILayer, LayerType } from '../../models/layers.model';
import { selectLayers, selectSelectedLayersIds } from '../../reducers/layers.reducer';
import { IEntitiesTableData, ITableRowModel } from '../../../../core/models/IEntitiesTableModel';
import { distinctUntilChanged, map, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
	getLayers$ = this.store$.pipe(
		select(selectLayers),
		map(this.filterLayer.bind(this)),
		distinctUntilChanged(isEqual));
	layers$: Observable<IEntitiesTableData<ILayer>> = this.getLayers$.pipe(
		map(this.createTableEntities.bind(this))
	);

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

	constructor(public store$: Store) {
	}

	openModal(type: SelectedModalEnum): void {
		this.layers$.pipe(
			take(1),
			map(layers => layers.entities[this.hoverLayer]),
			tap((layer) => this.store$.dispatch(new SetLayersModal({ type, layer })))
		).subscribe()

	}

	filterLayer(layers: ILayer[]): ILayer[] {
		return layers.filter(layer => layer.type === this.type);
	}

	toggleLayer() {
		if (this.hoverLayer) {
			this.selectedLayersIds$.pipe(
				take(1),
				map((layers: string[]) => layers.includes(this.hoverLayer)),
				tap((isCheck) => this.store$.dispatch(new SetLayerSelection({ id: this.hoverLayer, value: !isCheck })))
			).subscribe();
		}
	}

	private createTableEntities(layers: ILayer[]): IEntitiesTableData<ILayer> {
		const entitiesData: IEntitiesTableData<ILayer> = { ids: [], entities: {} };
		for (let layer of layers) {
			entitiesData.ids.push(layer.id);
			entitiesData.entities[layer.id] = layer;
		}
		return entitiesData
	}

}
