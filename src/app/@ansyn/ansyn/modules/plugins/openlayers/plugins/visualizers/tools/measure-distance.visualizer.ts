import {
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizersConfig,
	VisualizerInteractions,
	VisualizersConfig
} from '@ansyn/imagery';
import { combineLatest } from 'rxjs';
import { selectActiveMapId } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { ILabelHandler, MeasureRulerVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import {
	IMeasureData,
	selectIsMeasureToolActive,
	selectMeasureDataByMapId
} from '../../../../../menu-items/tools/reducers/tools.reducer';
import { Inject } from '@angular/core';
import { UpdateMeasureDataAction } from '../../../../../menu-items/tools/actions/tools.actions';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, VisualizersConfig],
	isHideable: true
})
export class MeasureDistanceVisualizer extends MeasureRulerVisualizer {
	measureData: IMeasureData;

	constructor(protected store$: Store<any>,
				protected projectionService: OpenLayersProjectionService,
				@Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(projectionService, config);
	}

	@AutoSubscription
	show$ = () => combineLatest(
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMeasureDataByMapId(this.mapId)),
		this.store$.select(selectIsMeasureToolActive),
		this.onHiddenStateChanged).pipe(
		distinctUntilChanged(),
		filter(([activeMapId, measureData, isMeasureToolActive]) => !this.isHidden && Boolean(measureData)),
		tap(([activeMapId, measureData, isMeasureToolActive]) => {
			this.measureData = measureData;
			if (!measureData.isLayerShowed) {
				this.iMap.removeLayer(this.vector);
			} else {
				this.iMap.addLayer(this.vector);
				this.enableRuler(isMeasureToolActive && activeMapId && measureData.isToolActive);
				this.startDeleteSingleEntity(isMeasureToolActive && activeMapId && measureData.isRemoveMeasureModeActive);
			}
		}),
		switchMap(([activeMapId, measureData, isMeasureToolActive]) => {
			return this.setEntities(measureData.meausres);
		}),
		filter(Boolean),
		tap(([activeMapId, measureData, isMeasureToolActive]) => {
			this.setLabelsFeature(this.measureData ? this.measureData.meausres : [])
		})
	);

	afterEntityDeleted(entity: IVisualizerEntity) {
		this.measureData.meausres = this.measureData.meausres.filter((measureEntity) => measureEntity.id !== entity.id);
		this.store$.dispatch(new UpdateMeasureDataAction({
			mapId: this.mapId,
			measureData: { meausres: this.measureData.meausres }
		}));
	}

	afterDrawEndEvent(entity: IVisualizerEntity) {
		this.measureData.meausres.push(entity);
		this.store$.dispatch(
			new UpdateMeasureDataAction({
				mapId: this.mapId,
				measureData: {
					meausres: this.measureData.meausres
				}
			})
		);
	}
}
