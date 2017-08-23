import { Actions, Effect } from '@ngrx/effects';
import { MapActionTypes, AddMapInstacneAction } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';

import { isNil as _isNil} from 'lodash';
import { ImageryCommunicatorService, IVisualizerEntity } from '@ansyn/imagery';
import { CasesActionTypes, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { CaseMapState } from 'app/packages/core';
import { ContextEntityVisualizerType } from 'app/app-visualizers/context-entity.visualizer';

@Injectable()
export class ContextEntityAppEffects {

	@Effect({dispatch:false})
	diplayEntityFromCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]:[SelectCaseByIdAction, ICasesState]) => !_isNil(caseState.selected_case.state.contextEntities))
		.map(([action, caseState]:[SelectCaseByIdAction, ICasesState]) => {
			const currentCase = caseState.selected_case;
			currentCase.state.maps.data.forEach((mapState: CaseMapState)=>{
				this.displayEntity(mapState.id, caseState.selected_case.state.contextEntities);
			});
		});

	@Effect({dispatch:false})
	diplayEntityFromNewMap$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]:[AddMapInstacneAction, ICasesState]) => !_isNil(caseState.selected_case.state.contextEntities))
		.map(([action, caseState]:[AddMapInstacneAction, ICasesState]) => {
			this.displayEntity(action.payload.currentCommunicatorId, caseState.selected_case.state.contextEntities);
		});

	constructor(
		private actions$: Actions,
		private store$: Store<IAppState>,
		private communicatorService: ImageryCommunicatorService
	){}

	private displayEntity(mapId: string, contextEntities: IVisualizerEntity[]) {
		const communicatorHandler = this.communicatorService.provide(mapId);
		if (communicatorHandler) {
			const vis = communicatorHandler.getVisualizer(ContextEntityVisualizerType);
			vis.setEntities(contextEntities);
		}
	}
}
