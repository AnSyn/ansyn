import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes, OverlaysMarkupAction,
	DisplayOverlayFromStoreAction, SetTimelineStateAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app-reducers.module';
import { ICasesState, Case, CaseMapState, CasesService } from '@ansyn/menu-items/cases';
import { LoadOverlaysAction, Overlay } from '@ansyn/overlays';
import { isEmpty, cloneDeep, isNil } from 'lodash';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { AddMapInstacneAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { last } from 'lodash';
import { ImageryCommunicatorService, IVisualizerEntity } from '@ansyn/imagery';
import { OverlayDisplayMode } from '@ansyn/core';
import { FootprintPolygonVisualizerType, FootprintHitmapVisualizerType } from '@ansyn/open-layer-visualizers';
import { SetActiveOverlaysFootprintModeAction } from '@ansyn/menu-items/tools/actions/tools.actions';

@Injectable()
export class OverlaysAppEffects {

	@Effect({dispatch:false})
	drawFootprintsFromCommunicatorAdded$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action: AddMapInstacneAction, overlaysState: IOverlayState, casesState: ICasesState) => {
			const activeMap: CaseMapState = casesState.selected_case.state.maps.data.find(map => map.id === action.payload.currentCommunicatorId);
			return [activeMap ,overlaysState];
		})
		.map(([caseMapState ,overlaysState]: [CaseMapState, IOverlayState])=> {
			this.drawOverlaysOnMap(caseMapState, overlaysState);
		});

	@Effect({ dispatch: false })
	drawFootprintsFromFilteredOverlays$: Observable<void> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS, OverlaysActionTypes.SET_TIMELINE_STATE, CasesActionTypes.UPDATE_CASE)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action, overlaysState: IOverlayState, casesState: ICasesState) => {
			return [overlaysState, casesState.selected_case];
		})
		.map(([overlaysState, selectedCase]: [IOverlayState, Case])=> {
			selectedCase.state.maps.data.forEach((mapData: CaseMapState)=>{
				this.drawOverlaysOnMap(mapData, overlaysState);
			});
		});


	/** effect fixed bug when opening the tools bar before overlays were loaded
	 *
	 * @type {Observable<SetActiveOverlaysFootprintModeAction>}
	 */
	@Effect()
	setActiveOverlaysModeFromLoadSuccess$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS, OverlaysActionTypes.DISPLAY_OVERLAY, MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action,cases]:[Action, ICasesState]) => !isEmpty(cases.selected_case))
		.map(([action,cases]:[Action,ICasesState])=> {
			const selectedMap = cases.selected_case.state.maps.data.find((mapData)=> {
				return mapData.id === cases.selected_case.state.maps.active_map_id;
			});
			return new SetActiveOverlaysFootprintModeAction(selectedMap.data.overlayDisplayMode);
		});

	@Effect()
	onOverlaysMarkupsChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action,cases]:[Action,ICasesState]) => !isEmpty(cases.selected_case) )
		.map(([action,cases]:[Action,ICasesState])=> {
			const overlaysMarkup = this.casesService.getOverlaysMarkup(cases.selected_case);
			return new OverlaysMarkupAction(overlaysMarkup);
		});

	@Effect()
	selectCase$: Observable<LoadOverlaysAction | void> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.filter(() => this.casesService.contextValues.imageryCount === -1)
		.map(toPayload)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([case_id, state]: [string, ICasesState]) => !isEmpty(state.selected_case))
		.map(([caseId, state]: [string, ICasesState]) => {
			const caseSelected: Case = state.selected_case;

			const overlayFilter: any = {
				to: caseSelected.state.time.to,
				from: caseSelected.state.time.from,
				polygon: caseSelected.state.region,
				caseId: caseId
			};
			return new LoadOverlaysAction(overlayFilter);
		});

	@Effect()
	selectCaseWithImageryCount$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.filter(() => this.casesService.contextValues.imageryCount !== -1)
		.withLatestFrom(this.store$.select('cases'), (action, cases: ICasesState) => cases.selected_case)
		.filter(selected_case => !isEmpty(selected_case))
		.switchMap((selected_case: Case) => {
			return this.overlaysService.getStartDateViaLimitFasets({
				region: selected_case.state.region,
				limit: this.casesService.contextValues.imageryCount,
				facets: selected_case.state.facets
			})
				.mergeMap((data: {startDate, endDate}) => {
					const from = new Date(data.startDate);
					const to = new Date(data.endDate);
					selected_case.state.time.from = from.toISOString();
					selected_case.state.time.to = to.toISOString();

					const overlayFilter: any = {
						to: selected_case.state.time.to,
						from: selected_case.state.time.from,
						polygon: selected_case.state.region,
						caseId: selected_case.id
					};

					return[
						new UpdateCaseAction(selected_case),
						new SetTimeAction({from, to}),
						new LoadOverlaysAction(overlayFilter)
					];
				});
		});



	@Effect()
	initTimelineStata$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.filter(() => this.casesService.contextValues.imageryCount !== -1)
		.withLatestFrom(this.store$.select('overlays'), (action, overlay: IOverlayState) => overlay.timelineState)
		.map((timelineState) => {
			const tenth = (timelineState.to.getTime() - timelineState.from.getTime()) / 10;
			const fromTenth = new Date(timelineState.from.getTime() - tenth);
			const toTenth = new Date(timelineState.to.getTime() + tenth);
			return new SetTimelineStateAction({from: fromTenth, to: toTenth});
		});

	@Effect()
	displayLatestOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS)
		.filter(action => this.casesService.contextValues.defaultOverlay === 'latest')
		.withLatestFrom(this.store$.select('overlays'), (action, overlays: IOverlayState) => {
			return overlays.filteredOverlays;
		})
		.filter((displayedOverlays) => !isEmpty(displayedOverlays))
		.map((displayedOverlays: any[]) => {
			const lastOverlayId = last(displayedOverlays);
			this.casesService.contextValues.defaultOverlay = '';
			return new DisplayOverlayFromStoreAction({id: lastOverlayId});
		})
		.share();


	constructor(
		public actions$: Actions,
		public store$: Store<IAppState>,
		public casesService: CasesService,
		public overlaysService: OverlaysService,
		private communicatorService: ImageryCommunicatorService) {}

	private drawOverlaysOnMap(mapData: CaseMapState, overlayState: IOverlayState) {
		const communicator = this.communicatorService.provide(mapData.id);
		if (communicator && mapData.data.overlayDisplayMode) {
			const polygonVisualizer = communicator.getVisualizer(FootprintPolygonVisualizerType);
			const hitMapvisualizer = communicator.getVisualizer(FootprintHitmapVisualizerType);
			const overlayDisplayMode: OverlayDisplayMode = mapData.data.overlayDisplayMode;
			switch (overlayDisplayMode) {
				case 'Hitmap': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					hitMapvisualizer.setEntities(entitiesToDraw);
					polygonVisualizer.clearEntities();
					break;
				}
				case 'Polygon': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					polygonVisualizer.setEntities(entitiesToDraw);
					hitMapvisualizer.clearEntities();
					break;
				}
				case 'None':
				default: {
					polygonVisualizer.clearEntities();
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
