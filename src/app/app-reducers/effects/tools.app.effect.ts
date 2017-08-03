import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../';
import { ToolsActionsTypes, SetActiveCenter } from '@ansyn/menu-items/tools/actions/tools.actions';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import 'rxjs/add/operator/withLatestFrom';
import { get as _get, isNil as _isNil } from 'lodash';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { SetPinLocationModeAction } from '@ansyn/menu-items/tools/actions/tools.actions';

@Injectable()
export class ToolsAppEffects {

	@Effect()
	getActiveCenter$: Observable<SetActiveCenter> = this.actions$
		.ofType(ToolsActionsTypes.PULL_ACTIVE_CENTER)
		.withLatestFrom(this.store$.select('cases'), (action, cases: ICasesState) => {
			const activeMapId: string = <string> _get(cases.selected_case, "state.maps.active_map_id");
			return this.imageryCommunicatorService.provide(activeMapId);
		})
		.filter( communicator => !_isNil(communicator))
		.map( (communicator: CommunicatorEntity) => {
			const activeMapCenter = communicator.getCenter();
			return new SetActiveCenter(activeMapCenter.coordinates);
		});


	@Effect({dispatch:false})
	updatePinLocationAction$: Observable<void> = this.actions$
		.ofType(ToolsActionsTypes.SET_PIN_LOCATION_MODE)
		.map((action: SetPinLocationModeAction) => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator) => {
				if (action.payload){
					communicator.createMapSingleClickEvent();
				} else {
					communicator.removeSingleClickEvent();
				}
			})
		});

	@Effect()
	onGoTo$: Observable<SetActiveCenter> = this.actions$
		.ofType(ToolsActionsTypes.GO_TO)
		.withLatestFrom(this.store$.select('cases'), (action, cases: ICasesState): any => {
			const activeMapId: string = <any> _get(cases.selected_case, "state.maps.active_map_id");
			return {action, communicator: this.imageryCommunicatorService.provide(activeMapId)};
		})
		.filter(({action, communicator})=> !_isNil(communicator))
		.map(({action, communicator}) => {
			const center: GeoJSON.Point = {
				type: 'Point',
				coordinates: action.payload
			};
			communicator.setCenter(center);
			return new SetActiveCenter(action.payload);
		});


	constructor(private actions$: Actions, private store$: Store<IAppState>, private imageryCommunicatorService: ImageryCommunicatorService) { }
}
