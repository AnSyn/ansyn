import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of, pipe } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import {
	IMapState,
	IPendingOverlay,
	LayoutKey,
	layoutOptions,
	MapActionTypes,
	mapStateSelector,
	RemovePendingOverlayAction,
	selectActiveMapId,
	selectFooterCollapse, selectLayout,
	selectMaps,
	selectMapsList,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetPendingOverlaysAction
} from '@ansyn/map-facade';
import { IAppState } from '../app.effects.module';

import { IImageryMapPosition } from '@ansyn/imagery';
import {
	catchError,
	filter,
	map,
	mergeMap,
	switchMap,
	withLatestFrom,
	distinctUntilKeyChanged,
	distinctUntilChanged
} from 'rxjs/operators';
import { isEqual } from 'lodash';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	SetHoveredOverlayAction,
	SetMarkUp,
	SetTotalOverlaysAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	IMarkUpData,
	MarkUpClass,
	selectDropMarkup,
} from '../../modules/overlays/reducers/overlays.reducer';
import { ExtendMap } from '../../modules/overlays/reducers/extendedMap.class';
import { overlayOverviewComponentConstants } from '../../modules/overlays/components/overlay-overview/overlay-overview.component.const';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { IOverlay } from '../../modules/overlays/models/overlay.model';
import { Dictionary } from '@ngrx/entity';
import { SetBadgeAction } from '@ansyn/menu';

@Injectable()
export class OverlaysAppEffects {

	@Effect()
	displayMultipleOverlays$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE),
		filter((action: DisplayMultipleOverlaysFromStoreAction) => action.payload.length > 0),
		withLatestFrom(this.store$.select(selectMapsList)),
		mergeMap(([action, mapsList]: [DisplayMultipleOverlaysFromStoreAction, ICaseMapState[]]): any => {
			const validPendingOverlays = action.payload;
			/* theoretical situation */
			if (validPendingOverlays.length <= mapsList.length) {
				return validPendingOverlays.map((pendingOverlay: IPendingOverlay, index: number) => {
					let { overlay, extent } = pendingOverlay;
					let mapId = mapsList[index].id;
					return new DisplayOverlayAction({ overlay, mapId, extent });
				});
			}

			const layout = Array.from(layoutOptions.keys()).find((key: LayoutKey) => {
				const layout = layoutOptions.get(key);
				return layout.mapsCount === validPendingOverlays.length;
			});
			return [new SetPendingOverlaysAction(validPendingOverlays), new SetLayoutAction(layout)];
		})
	);

	@Effect()
	displayPendingOverlaysOnChangeLayoutSuccess$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SET_LAYOUT_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]) => mapState.pendingOverlays.length > 0),
		mergeMap(([action, mapState]: [SetLayoutSuccessAction, IMapState]) => {
			return mapState.pendingOverlays.map((pendingOverlay: any, index: number) => {
				const { overlay, extent } = pendingOverlay;
				const mapId = Object.values(mapState.entities)[index].id;
				return new DisplayOverlayAction({ overlay, mapId, extent });
			});
		})
	);

	@Effect()
	removePendingOverlayOnDisplay$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => mapState.pendingOverlays.some((pending) => pending.overlay.id === action.payload.overlay.id)),
		map(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => {
			return new RemovePendingOverlayAction(action.payload.overlay.id);
		})
	);

	@Effect()
	onDisplayOverlayFromStore$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE),
		withLatestFrom(this.overlaysService.getAllOverlays$, this.store$.select(selectActiveMapId), this.store$.select(selectLayout)),
		filter(([{ payload }, overlays, activeMapId, layout]: [DisplayOverlayFromStoreAction, Map<string, IOverlay>, string, string]) => overlays && overlays.has(payload.id)),
		mergeMap(([{ payload }, overlays, activeMapId, layout]: [DisplayOverlayFromStoreAction, Map<string, IOverlay>, string, string]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			const actions: Action[] = [new DisplayOverlayAction({
				overlay,
				mapId,
				extent: payload.extent,
				customOriantation: payload.customOriantation
			})];

			const oneMapLayout = 'layout1';
			const twoMapsLayout = 'layout2';
			if (layout === oneMapLayout) {
				actions.push(new SetLayoutAction(twoMapsLayout));
			}

			return actions;
		})
	);

	private getOverlayFromDropMarkup = map(([markupMap, overlays]: [ExtendMap<MarkUpClass, IMarkUpData>, Map<any, any>]) =>
		overlays.get(markupMap && markupMap.get(MarkUpClass.hover) && markupMap.get(MarkUpClass.hover).overlaysIds[0])
	);

	private getPositionForActiveMap = pipe(
		withLatestFrom(this.store$.select(selectActiveMapId)),
		withLatestFrom(this.store$.select(selectMaps)),
		filter(([[overlay, activeMapId], mapsList]: [[IOverlay, string], Dictionary<ICaseMapState>]) => Boolean(mapsList) && Boolean(mapsList[activeMapId])),
		map(([[overlay, activeMapId], mapsList]: [[IOverlay, string], Dictionary<ICaseMapState>]) => {
			const result = [overlay, mapsList[activeMapId].data.position];
			return result;
		})
	);

	private getOverlayWithNewThumbnail: any = switchMap(([overlay, position]: [IOverlay, IImageryMapPosition]) => {
		if (!overlay) {
			return [overlay];
		}
		this.store$.dispatch(new SetHoveredOverlayAction(<IOverlay>{
			...overlay,
			thumbnailUrl: overlayOverviewComponentConstants.FETCHING_OVERLAY_DATA
		}));
		return this.overlaysService.getThumbnailUrl(overlay, position).pipe(
			map(thumbnailUrl => ({
				...overlay,
				thumbnailUrl,
				thumbnailName: this.overlaysService.getThumbnailName(overlay)
			})),
			catchError(() => {
				return of(overlay);
			})
		);
	});

	private getHoveredOverlayAction = map((overlay: IOverlay) => {
		return new SetHoveredOverlayAction(overlay);
	});

	@Effect()
	setHoveredOverlay$: Observable<any> = combineLatest([this.store$.select(selectDropMarkup), this.store$.select(selectFooterCollapse)])
		.pipe(
			filter(([drop, footerCollapse]) => Boolean(!footerCollapse)),
			distinctUntilChanged( isEqual),
			withLatestFrom<any, any>(this.overlaysService.getAllOverlays$, ([drop, footer], overlays) => [drop, overlays]),
			this.getOverlayFromDropMarkup,
			this.getPositionForActiveMap,
			this.getOverlayWithNewThumbnail,
			this.getHoveredOverlayAction
		)
		.pipe(
			catchError(err => {
				console.error(err);
				return of(err);
			})
		);

	@Effect()
	activeMapLeave$ = this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE),
		map(() => new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }))
	);

	@Effect()
	updateResultTableBadge$: Observable<SetBadgeAction> = this.actions$.pipe(
		ofType<SetTotalOverlaysAction>(OverlaysActionTypes.SET_TOTAL_OVERLAYS),
		distinctUntilKeyChanged('payload'),
		map((action) => new SetBadgeAction({ key: 'Results table', badge: `${ action.payload.number }` })));

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public overlaysService: OverlaysService) {
	}

}
