import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ICoreState, selectRegion } from '../reducers/core.reducer';
import { Observable } from 'rxjs';
import { SetOverlaysCriteriaAction } from '../actions/core.actions';
import { CaseGeoFilter } from '@ansyn/imagery';
import { ContextMenuTriggerAction, MapActionTypes } from '@ansyn/map-facade';
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators';
import { Position } from 'geojson';
import * as turf from '@turf/turf';

@Injectable()
export class CoreEffects {

	region$ = this.store$.select(selectRegion);

	isPinPointSearch$ = this.region$.pipe(
		filter(Boolean),
		map((region) => region.type === CaseGeoFilter.PinPoint),
		distinctUntilChanged()
	);

	@Effect()
	onPinPointSearch$: Observable<SetOverlaysCriteriaAction | any> = this.actions$.pipe(
		ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU),
		withLatestFrom(this.isPinPointSearch$),
		filter(([{ payload }, isPinPointSearch]: [ContextMenuTriggerAction, boolean]) => isPinPointSearch),
		map(([{ payload }, isPinPointSearch]: [ContextMenuTriggerAction, boolean]) => payload),
		map((payload: Position) => {
			const region = turf.geometry('Point', payload);
			return new SetOverlaysCriteriaAction({ region });
		})
	);


	constructor(protected actions$: Actions,
				protected store$: Store<ICoreState>) {
	}
}
