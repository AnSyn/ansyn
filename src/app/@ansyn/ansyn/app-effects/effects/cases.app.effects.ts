import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import {
	DisplayOverlayAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	OverlaysService
} from '@ansyn/overlays';
import {
	CasesActionTypes,
	LoadDefaultCaseIfNoActiveCaseAction,
	SelectCaseAction,
	SelectDilutedCaseAction
} from '@ansyn/menu-items';
import { IMapState, mapStateSelector } from '@ansyn/map-facade';
import { IDilutedCase, Overlay, SetMapsDataActionStore, SetToastMessageAction } from '@ansyn/core';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { HttpErrorResponse } from '@angular/common/http';
import { uniqBy } from 'lodash';
import { IAppState } from '../app.effects.module';

@Injectable()
export class CasesAppEffects {

	@Effect()
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [DisplayOverlayAction, IMapState]) => {

			const updatedMapsList = [...mapState.mapsList];
			const mapId = action.payload.mapId || mapState.activeMapId;

			updatedMapsList.forEach((map) => {
				if (mapId === map.id) {
					map.data.overlay = action.payload.overlay;
				}
			});
			return new SetMapsDataActionStore({ mapsList: updatedMapsList });
		}).share();

	@Effect()
	loadCase$: Observable<any> = this.actions$
		.ofType<SelectDilutedCaseAction>(CasesActionTypes.SELECT_DILUTED_CASE)
		.map(({ payload }: SelectDilutedCaseAction) => payload)
		.mergeMap((caseValue: IDilutedCase) => {
			let resultObservable = Observable.of([]);

			const observablesArray = uniqBy(caseValue.state.maps.data.filter(mapData => Boolean(mapData.data.overlay))
					.map((mapData) => mapData.data.overlay)
					.concat(caseValue.state.favoriteOverlays,
						caseValue.state.presetOverlays || [])
				, 'id')
				.map(({ id, sourceType }: Overlay) => this.overlaysService.getOverlayById(id, sourceType));

			if (observablesArray.length > 0) {
				resultObservable = Observable.forkJoin(observablesArray);
			}

			return resultObservable
				.map(overlays => new Map(overlays.map((overlay): [string, Overlay] => [overlay.id, overlay])))
				.map((mapOverlay: Map<string, Overlay>) => {
					caseValue.state.favoriteOverlays = caseValue.state.favoriteOverlays
						.map((favOverlay: Overlay) => mapOverlay.get(favOverlay.id));

					caseValue.state.presetOverlays = (caseValue.state.presetOverlays || [])
						.map((preOverlay: Overlay) => mapOverlay.get(preOverlay.id));

					caseValue.state.maps.data
						.filter(mapData => Boolean(Boolean(mapData.data.overlay)))
						.forEach((map) => map.data.overlay = mapOverlay.get(map.data.overlay.id));

					return new SelectCaseAction(caseValue);
				})
				.catch((result: HttpErrorResponse) => {
					return [new SetToastMessageAction({
						toastText: `Failed to load case (${result.status})`,
						showWarningIcon: true
					}),
						new LoadDefaultCaseIfNoActiveCaseAction()];
				});
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected overlaysService: OverlaysService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
