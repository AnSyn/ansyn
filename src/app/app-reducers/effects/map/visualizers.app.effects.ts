import { Actions, Effect, toPayload } from '@ngrx/effects';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { HoverFeatureChangedTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import { Case } from '@ansyn/core/models/case.model';
import { OverlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { MouseOutDropAction, MouseOverDropAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { FootprintPolylineVisualizerType } from '@ansyn/open-layer-visualizers/overlays/polyline-visualizer';
import { ISyncHoverEvent } from '@ansyn/imagery/model/imap-visualizer';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CaseMapState, OverlayDisplayMode } from '@ansyn/core/models/case.model';
import { IVisualizerEntity } from '@ansyn/imagery/model/imap-visualizer';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { FootprintHitmapVisualizerType } from '@ansyn/open-layer-visualizers/overlays/hitmap-visualizer';
import { cloneDeep as _cloneDeep } from 'lodash';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { DrawOverlaysOnMapTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import { DisplayOverlayFromStoreAction } from '../../../packages/overlays/actions/overlays.actions';

@Injectable()
export class VisualizersAppEffects {

	@Effect()
	onHoverFeatureSetMarkup$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'))
		.map(([action, selectedCase]: [HoverFeatureChangedTriggerAction, Case]) => {
			const markups = CasesService.getOverlaysMarkup(selectedCase, action.payload);
			return new OverlaysMarkupAction(markups);
		});

	@Effect({dispatch: false})
	onHoverFeatureEmitSyncHoverFeature$: Observable<void> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.map((action): void => {
			const event: ISyncHoverEvent = {
				id: action.payload,
				isIn: !!action.payload
			};
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator: CommunicatorEntity) => {
				communicator.getVisualizer(FootprintPolylineVisualizerType).syncHoverFeature.emit(event);
			});
		});


	@Effect({dispatch: false})
	onMouseOverDropAction$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.MOUSE_OVER_DROP, OverlaysActionTypes.MOUSE_OUT_DROP)
		.map((action: MouseOverDropAction | MouseOutDropAction) => {
			const event: ISyncHoverEvent = {
				id: action.payload,
				isIn: action instanceof MouseOverDropAction
			};
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator: CommunicatorEntity) => {
				communicator.getVisualizer(FootprintPolylineVisualizerType).syncHoverFeature.emit(event);
			});
		});

	@Effect()
	onDbclickFeatureDisplayAction$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.DBCLICK_FEATURE)
		.map(toPayload)
		.map(id => new DisplayOverlayFromStoreAction({id}));


	@Effect({dispatch: false})
	markupVisualizer$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.map((action: OverlaysMarkupAction) => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator: CommunicatorEntity) => {
				communicator.getVisualizer(FootprintPolylineVisualizerType).markupFeatures.emit(action.payload);
			});
		});

	@Effect()
	updateCaseFromTools$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases'))
		.mergeMap(([payload, casesState]: [OverlayDisplayMode, ICasesState]) => {
			const updatedCase = _cloneDeep(casesState.selected_case);
			const activeMap = CasesService.activeMap(updatedCase);
			activeMap.data.overlayDisplayMode = payload;
			return [
				new UpdateCaseAction(updatedCase),
				new DrawOverlaysOnMapTriggerAction()
			];
		});


	@Effect()
	shouldDrawOverlaysOnMap$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS)
		.map((action) => new DrawOverlaysOnMapTriggerAction());

	@Effect({ dispatch: false })
	drawFootprintsFromFilteredOverlays$: Observable<void> = this.actions$
		.ofType(MapActionTypes.DRAW_OVERLAY_ON_MAP)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action, overlaysState: IOverlayState, casesState: ICasesState) => {
			return [overlaysState, casesState.selected_case];
		})
		.map(([overlaysState, selectedCase]: [IOverlayState, Case])=> {
			selectedCase.state.maps.data.forEach((mapData: CaseMapState)=>{
				this.drawOverlaysOnMap(mapData, overlaysState);
			});
		});


	constructor(
		private actions$: Actions,
		private store$: Store<IAppState>,
		private imageryCommunicatorService: ImageryCommunicatorService
	){}

	private drawOverlaysOnMap(mapData: CaseMapState, overlayState: IOverlayState) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator && mapData.data.overlayDisplayMode) {
			const polylineVisualizer = communicator.getVisualizer(FootprintPolylineVisualizerType);
			const hitMapvisualizer = communicator.getVisualizer(FootprintHitmapVisualizerType);
			const overlayDisplayMode: OverlayDisplayMode = mapData.data.overlayDisplayMode;
			switch (overlayDisplayMode) {
				case 'Hitmap': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					hitMapvisualizer.setEntities(entitiesToDraw);
					polylineVisualizer.clearEntities();
					break;
				}
				case 'Polygon': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					polylineVisualizer.setEntities(entitiesToDraw);
					hitMapvisualizer.clearEntities();
					break;
				}
				case 'None':
				default: {
					polylineVisualizer.clearEntities();
					hitMapvisualizer.clearEntities();
				}
			}
		}
	}
	private getEntitiesToDraw(overlayState: IOverlayState): IVisualizerEntity[] {
		const overlaysToDraw = OverlaysService.pluck(overlayState.overlays, overlayState.filteredOverlays,["id", "name", "footprint"])
		const entitiesToDraw: IVisualizerEntity[] = [];
		overlaysToDraw.forEach((entity: {id: string, name: string, footprint: GeoJSON.Polygon}) => {
			const feature: GeoJSON.Feature<any> = {
				type: 'Feature',
				geometry: entity.footprint,
				properties: {}
			};
			entitiesToDraw.push({id: entity.id, featureJson: feature});
		});
		return entitiesToDraw;
	}


}
