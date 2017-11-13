import { Actions, Effect } from '@ngrx/effects';
import { AddMapInstanceAction, BackToWorldAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { CaseMapState } from '@ansyn/core';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { isNil as _isNil } from 'lodash';
import { CommunicatorEntity, ImageryCommunicatorService, IVisualizerEntity } from '@ansyn/imagery';
import {
	ContextEntityVisualizer,
	ContextEntityVisualizerType
} from '../../../app-providers/app-visualizers/context-entity.visualizer';
import { DisplayOverlayAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';

@Injectable()
export class ContextEntityAppEffects {

	/**
	 * @type Effect
	 * @name displayEntityFromCase$
	 * @ofType SelectCaseAction
	 * @filter case has contextEntities
	 */
	@Effect({ dispatch: false })
	displayEntityFromCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({ payload }: SelectCaseAction) => !_isNil(payload.state.contextEntities))
		.do(({ payload }: SelectCaseAction) => {
			payload.state.maps.data.forEach((mapState: CaseMapState) => {
				const overlayDate = mapState.data.overlay ? mapState.data.overlay.date : null;
				this.setContextEntity(mapState.id, overlayDate, payload.state.contextEntities);
			});
		});

	/**
	 * @type Effect
	 * @name displayEntityFromNewMap$
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction
	 * @dependencies cases, map
	 * @filter selected case has contextEntities
	 */
	@Effect({ dispatch: false })
	displayEntityFromNewMap$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(mapStateSelector))
		.filter(([action, caseState, mapStore]: [AddMapInstanceAction, ICasesState, IMapState]) => !_isNil(caseState.selectedCase.state.contextEntities))
		.map(([action, caseState, mapStore]: [AddMapInstanceAction, ICasesState, IMapState]) => {
			const mapState: CaseMapState = MapFacadeService.mapById(mapStore.mapsList, action.payload.currentCommunicatorId);
			const overlayDate = mapState.data.overlay ? mapState.data.overlay.date : null;
			this.setContextEntity(mapState.id, overlayDate, caseState.selectedCase.state.contextEntities);
		});

	/**
	 * @type Effect
	 * @name displayEntityFromNewMap$
	 * @ofType DisplayOverlayAction
	 * @dependencies cases, map
	 * @filter selected case has contextEntities
	 */
	@Effect({ dispatch: false })
	displayEntityTimeFromOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(mapStateSelector))
		.filter(([action, caseState]: [DisplayOverlayAction, ICasesState, IMapState]) => !_isNil(caseState.selectedCase.state.contextEntities))
		.map(([action, caseState, mapStore]: [DisplayOverlayAction, ICasesState, IMapState]) => {
			const mapId = action.payload.mapId ? action.payload.mapId : mapStore.activeMapId;
			const mapState: CaseMapState = MapFacadeService.mapById(mapStore.mapsList, mapId);
			const communicatorHandler = this.communicatorService.provide(mapId);
			this.setContextOverlayDate(communicatorHandler, mapState.data.overlay.date);
		});

	/**
	 * @type Effect
	 * @name displayEntityTimeFromBackToWorld$
	 * @ofType BackToWorldAction
	 * @dependencies cases
	 * @filter selected case has contextEntities
	 */
	@Effect({ dispatch: false })
	displayEntityTimeFromBackToWorld$: Observable<any> = this.actions$
		.ofType(MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select(casesStateSelector))
		.filter(([action, caseState]: [BackToWorldAction, ICasesState]) => !_isNil(caseState.selectedCase.state.contextEntities))
		.map(([action, caseState]: [BackToWorldAction, ICasesState]) => {
			const mapId = action.payload.mapId ? action.payload.mapId : caseState.selectedCase.state.maps.activeMapId;
			const communicatorHandler = this.communicatorService.provide(mapId);
			this.setContextOverlayDate(communicatorHandler, null);
		});

	constructor(protected actions$: Actions,
				private store$: Store<IAppState>,
				private communicatorService: ImageryCommunicatorService) {
	}

	private setContextEntity(mapId: string, overlayDate: Date, contextEntities: IVisualizerEntity[]) {
		const communicatorHandler = this.communicatorService.provide(mapId);
		if (communicatorHandler) {
			const visualizer = <ContextEntityVisualizer>communicatorHandler.getVisualizer(ContextEntityVisualizerType);
			if (visualizer) {
				visualizer.setReferenceDate(overlayDate);
				visualizer.setEntities(contextEntities);
			}
		}
	}

	private setContextOverlayDate(communicatorHandler: CommunicatorEntity, overlayDate: Date) {
		const visualizer = <ContextEntityVisualizer>communicatorHandler.getVisualizer(ContextEntityVisualizerType);
		if (visualizer) {
			visualizer.setReferenceDate(overlayDate);
		}
	}
}
