import { ISentinelState } from '../reducers/sentinel.reducer';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { SentinelLayersService } from '../services/sentinel-layers.service';
import { SentinelActionTypes, SetSentinelLayerOnMap } from '../actions/sentinel.actions';
import { map, withLatestFrom } from 'rxjs/operators';
import { selectMaps } from '@ansyn/map-facade';
import { DisplayOverlayAction } from '@ansyn/ansyn';

@Injectable()
export class SentinelEffects {

	displaySentinelLayer$ = createEffect(() => this.actions$.pipe(
		ofType(SetSentinelLayerOnMap),
		withLatestFrom(this.store$.select(selectMaps)),
		map(([payload, maps]) => DisplayOverlayAction({
			overlay: maps[payload.id].data.overlay,
			mapId: payload.id,
			force: true
		})))
	);

	constructor(protected actions$: Actions,
				protected sentinelService: SentinelLayersService,
				protected store$: Store<ISentinelState>) {
	}
}
