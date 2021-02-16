import {
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizersConfig,
	VisualizersConfig
} from '@ansyn/imagery';
import { combineLatest } from 'rxjs';
import { selectMaps } from '@ansyn/map-facade';
import { Store, select } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { MeasureRulerVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { filter, switchMap, tap, map } from 'rxjs/operators';
import { Inject } from '@angular/core';
import {
	selectIsMeasureToolActive
} from '../../../../../status-bar/components/tools/reducers/tools.reducer';
import {
	AddMeasureAction, RemoveMeasureAction,
} from '../../../../../status-bar/components/tools/actions/tools.actions';
import { isEqual } from 'lodash';

export const measuresClassNameForExport = 'measures-layer';
@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, VisualizersConfig],
	layerClassName: measuresClassNameForExport,
	isHideable: true
})
export class MeasureDistanceVisualizer extends MeasureRulerVisualizer {
	mapMeasures$ = this.store$.pipe(
		select(selectMaps),
		map( (maps) => maps[this.mapId]?.data?.measuresData)
	);

	@AutoSubscription
	show$ = combineLatest([
		this.mapMeasures$,
		this.store$.select(selectIsMeasureToolActive)]).pipe(
		// filter() update - checking isMeasureToolActive: if the measures layer is
		// hidden, we still want to proceed if the measure tool changed to inactive,
		// in order to cancel cursor style and interactions.
		filter(([measureData, isMeasureToolActive]) => (!this.isHidden || !isMeasureToolActive)),
		tap(([measureData, isMeasureToolActive]) => {
			if (measureData) {
				if (!measureData?.isLayerShowed) {
					this.iMap.removeLayer(this.vector);
				} else {
					this.iMap.addLayer(this.vector);
					this.enableRuler(isMeasureToolActive && measureData?.isToolActive);
					this.startDeleteSingleEntity(isMeasureToolActive && measureData?.isRemoveMeasureModeActive);
				}
			}
		}),
		switchMap(([measureData, isMeasureToolActive]) => {
			const entities = measureData.measures ? measureData?.measures.reduce((entities: IVisualizerEntity[], measure: IVisualizerEntity) => {
				const textMeasures = measure.featureJson.properties.measures;
				entities.push(measure, ...textMeasures);
				return entities;
			}, []) : [];
			return this.setEntities(entities);
		})
	);
	constructor(protected store$: Store<any>,
				protected projectionService: OpenLayersProjectionService,
				@Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(projectionService, config);
	}

	afterEntityDeleted(entity: IVisualizerEntity) {
		this.store$.dispatch(new RemoveMeasureAction({
			mapId: this.mapId,
			measureId: entity.id
		}));
	}

	afterDrawEndEvent(entity: IVisualizerEntity) {
		this.store$.dispatch(
			new AddMeasureAction({
				mapId: this.mapId,
				measure: entity
			})
		);
	}
}
