import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import {
	DisableMouseShadow,
	EnableMouseShadow,
	StopMouseShadow,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import * as MapActions from '@ansyn/map-facade/actions';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ToolsMapEffects {
	@Effect()
	updatePinLocationState$: any = this.actions$
		.ofType(ToolsActionsTypes.SET_PIN_LOCATION_MODE)
		.map(({ payload }) => new MapActions.PinLocationModeTriggerAction(payload));

	@Effect()
	onLayoutsChangeSetMouseShadowEnable$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SET_LAYOUT)
		.mergeMap(({ payload }) => {
			if (payload.maps_count === 1) {
				return [
					new DisableMouseShadow(),
					new StopMouseShadow()
				];
			}
			return [new EnableMouseShadow()];
		});

	constructor(private actions$: Actions) {
	}
}
