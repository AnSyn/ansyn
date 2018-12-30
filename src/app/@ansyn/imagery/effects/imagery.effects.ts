import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { ImageryState, selectCommunicators } from '../reducers/imagery.reducers';
import {
	ChangeImageryMap,
	ChangeImageryMapSuccess,
	CreateImagery,
	ImageryActionType,
	PositionChangedAction
} from '../actions/imagery.actions';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';

@Injectable()
export class ImageryEffects {

	@Effect()
	createImagery$ = this.actions$.pipe(
		ofType<CreateImagery>(ImageryActionType.createImagery),
		map(({ payload: { settings: { id, worldView: { mapType, sourceType } } } }) => {
			return new ChangeImageryMap({ id, mapType, sourceType });
		})
	);

	@Effect()
	changeImageryMap$ = this.actions$.pipe(
		ofType<ChangeImageryMap>(ImageryActionType.changeImageryMap),
		withLatestFrom(this.store$.select(selectCommunicators)),
		mergeMap(([{ payload: { id, mapType, sourceType } }, communicators]) => {
			const communicator = this.communicatorsService.provide(id);
			return fromPromise(communicator.setActiveMap(mapType, communicators[id].settings.data.position, sourceType)).pipe(
				map(() => new ChangeImageryMapSuccess({ id, mapType, sourceType }))
			);
		})
	);

	@Effect({ dispatch: false })
	changeImageryMapSuccess$ = this.actions$.pipe(
		ofType<ChangeImageryMapSuccess>(ImageryActionType.changeImageryMapSuccess),
		tap(({ payload: { id } }) => this.communicatorsService.provide(id).initPlugins())
	);

	@Effect()
	positionChange$ = this.actions$.pipe(
		ofType<ChangeImageryMapSuccess>(ImageryActionType.changeImageryMapSuccess),
		switchMap(({ payload: { id } }) => this.communicatorsService.provide(id).positionChanged.pipe(
			map((payload: any) => new PositionChangedAction(payload))
		))
	);


	constructor(protected actions$: Actions,
				protected store$: Store<ImageryState>,
				protected communicatorsService: ImageryCommunicatorService) {
	}
}

