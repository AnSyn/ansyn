import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { groupBy } from 'lodash';
import { map, withLatestFrom } from 'rxjs/operators';
import { ILayer, ILayersEntities, LayerType } from '../../models/layers.model';
import { ILayerState, selectLayers } from '../../reducers/layers.reducer';
import { IEntitiesTableData, ITableRowModel } from '../../../../core/models/IEntitiesTableModel';
import {
	IMarkUpData,
	MarkUpClass,
	selectDropMarkup,
	selectOverlaysMap
} from '../../../../overlays/reducers/overlays.reducer';
import { ExtendMap } from '../../../../overlays/reducers/extendedMap.class';
import { IOverlay } from '../../../../overlays/models/overlay.model';
import { AnsynDatePipe } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-layer-managers',
	templateUrl: './layers-manager.component.html',
	styleUrls: ['./layers-manager.component.less']
})

export class LayersManagerComponent {
	readonly layersRowsData: ITableRowModel<ILayer>[] = [
		{
			headName: 'Layer name',
			propertyName: 'name'
		}
	];

	readonly overlaysRowData: ITableRowModel<IOverlay>[] = [
		{
			headName: 'Date & Time',
			propertyName: 'date',
			pipe: new AnsynDatePipe()
		},
		{
			headName: 'Sensor',
			propertyName: 'sensorName'
		},
		{
			headName: 'Type',
			propertyName: 'sensorType'
		},
		{
			headName: 'Resolution',
			propertyName: 'resolution'
		}
	];

	public layers$: Observable<ILayersEntities[]> = this.store
		.pipe(
			select(selectLayers),
			map((layers: ILayer[]): ILayersEntities[] => {
				const layersType = [LayerType.static, LayerType.annotation, LayerType.base];
				const typeGroupedLayers = groupBy(layers, l => l.type);
				const entitiesData: ILayersEntities[] = layersType.map((type: LayerType): ILayersEntities => ({
					type,
					data: this.createTableEntities(typeGroupedLayers[type] || [])
				}));
				return entitiesData;
			})
		);

	public overlays$: Observable<ILayersEntities> = this.store.pipe(
		select(selectDropMarkup),
		withLatestFrom(this.store.pipe(select(selectOverlaysMap)), (drops, overlays) => [drops.get(MarkUpClass.displayed)?.overlaysIds, drops.get(MarkUpClass.active)?.overlaysIds, overlays]),
		map( ([displayOverlaysId, activeOverlaysIds, overlays]) => {
			return activeOverlaysIds.concat(displayOverlaysId)?.map( id => overlays.get(id));
		}),
		map( overlays => ({
			type: 'Overlays',
			data: this.createTableEntities(overlays)
		}))
	);

	constructor(
		protected store: Store<ILayerState>	) {
		this.layers$.subscribe( (layers) => console.log({layers}));
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
