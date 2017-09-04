import { Actions, Effect } from '@ngrx/effects';
import { MapActionTypes, AddMapInstacneAction } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { CaseMapState } from '@ansyn/core';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { CasesActionTypes, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';

import { isNil as _isNil} from 'lodash';
import { ImageryCommunicatorService, IVisualizerEntity, CommunicatorEntity } from '@ansyn/imagery';
import { ContextEntityVisualizerType, ContextEntityVisualizer } from 'app/app-visualizers/context-entity.visualizer';
import { DisplayOverlayAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { BackToWorldAction } from '@ansyn/map-facade/actions/map.actions';

@Injectable()
export class ContextEntityAppEffects {

	@Effect({dispatch:false})
	displayEntityFromCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]:[SelectCaseByIdAction, ICasesState]) => !_isNil(caseState.selected_case.state.contextEntities))
		.map(([action, caseState]:[SelectCaseByIdAction, ICasesState]) => {
			const currentCase = caseState.selected_case;
			currentCase.state.maps.data.forEach((mapState: CaseMapState)=>{
				const overlayDate =  mapState.data.overlay ? mapState.data.overlay.date : null;
				this.setContextEntity(mapState.id, overlayDate, caseState.selected_case.state.contextEntities);
			});
		});

	@Effect({dispatch:false})
	displayEntityFromNewMap$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]:[AddMapInstacneAction, ICasesState]) => !_isNil(caseState.selected_case.state.contextEntities))
		.map(([action, caseState]:[AddMapInstacneAction, ICasesState]) => {
			const mapState: CaseMapState = CasesService.mapById(caseState.selected_case, action.payload.currentCommunicatorId);
			const overlayDate =  mapState.data.overlay ? mapState.data.overlay.date : null;
			this.setContextEntity(mapState.id, overlayDate, caseState.selected_case.state.contextEntities);
		});

	@Effect({dispatch:false})
	displayEntityTimeFromOverlay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]:[DisplayOverlayAction, ICasesState]) => !_isNil(caseState.selected_case.state.contextEntities))
		.map(([action, caseState]:[DisplayOverlayAction, ICasesState]) => {
			const mapId = action.payload.map_id ? action.payload.map_id : caseState.selected_case.state.maps.active_map_id;
			const mapState: CaseMapState = CasesService.mapById(caseState.selected_case, mapId);
			const communicatorHandler = this.communicatorService.provide(mapId);
			this.setContextOverlayDate(communicatorHandler, mapState.data.overlay.date);
		});

	@Effect({dispatch:false})
	displayEntityTimeFromBackToWorld$: Observable<any> = this.actions$
		.ofType(MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]:[BackToWorldAction, ICasesState]) => !_isNil(caseState.selected_case.state.contextEntities))
		.map(([action, caseState]:[BackToWorldAction, ICasesState]) => {
			const mapId = action.payload.mapId ? action.payload.mapId : caseState.selected_case.state.maps.active_map_id;
			const communicatorHandler = this.communicatorService.provide(mapId);
			this.setContextOverlayDate(communicatorHandler, null);
		});

	constructor(
		private actions$: Actions,
		private store$: Store<IAppState>,
		private communicatorService: ImageryCommunicatorService
	){}

	private setContextEntity(mapId: string, overlayDate: Date, contextEntities: IVisualizerEntity[]) {
		const communicatorHandler = this.communicatorService.provide(mapId);
		if (communicatorHandler) {
			const vis = <ContextEntityVisualizer>communicatorHandler.getVisualizer(ContextEntityVisualizerType);
			if (vis) {
				vis.setReferenceDate(overlayDate);
				vis.setEntities(contextEntities);
			}
		}
	}

	private setContextOverlayDate(communicatorHandler: CommunicatorEntity, overlayDate: Date) {
		const vis = <ContextEntityVisualizer>communicatorHandler.getVisualizer(ContextEntityVisualizerType);
		if (vis) {
			vis.setReferenceDate(overlayDate);
		}
	}
}
