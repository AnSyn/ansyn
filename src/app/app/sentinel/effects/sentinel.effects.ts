import { DisplayOverlayAction } from "@ansyn/ansyn";
import { ISentinelState } from "../reducers/sentinel.reducer";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Injectable } from "@angular/core";
import { SentinelLayersService } from "../services/sentinel-layers.service";
import { SentinelActionTypes, SetSentinelLayerOnMap } from "../actions/sentinel.actions";
import { map, withLatestFrom } from "rxjs/operators";
import { selectMaps } from '../../../@ansyn/map-facade/reducers/map.reducer'

@Injectable()
export class SentinelEffects {

	@Effect()
	displaySentinelLayer$ = this.actions$.pipe(
		ofType<SetSentinelLayerOnMap>(SentinelActionTypes.SET_LAYER_ON_MAP),
		withLatestFrom(this.store$.select(selectMaps)),
		map(([{ payload }, maps]) => new DisplayOverlayAction({ overlay: maps[payload.id].data.overlay, mapId: payload.id, force: true }))
	)

	constructor(protected actions$: Actions,
				protected sentinelService: SentinelLayersService,
				protected store$: Store<ISentinelState>) {
	}
}
