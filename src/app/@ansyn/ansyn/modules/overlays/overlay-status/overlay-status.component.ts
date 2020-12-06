import { Component, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import {
	IEntryComponent,
	selectActiveMapId,
	selectHideLayersOnMap,
	selectOverlayByMapId,
} from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest, Observable } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';
import { GeoRegisteration, IOverlay } from '../models/overlay.model';
import {
	ToggleDraggedModeAction,
	ToggleFavoriteAction,
	SetAutoImageProcessing
} from './actions/overlay-status.actions';
import {
	IOverlayStatusState,
	overlayStatusStateSelector,
	selectFavoriteOverlays,
	selectOverlaysManualProcessArgs,
	selectTranslationData
} from './reducers/overlay-status.reducer';
import { AnnotationMode } from '@ansyn/ol';
import { IImageManualProcessArgs, ITranslationData } from '../../menu-items/cases/models/case.model';
import { Actions, ofType } from '@ngrx/effects';
import {
	SetAnnotationMode,
	ToolsActionsTypes,
	ClearActiveInteractionsAction
} from '../../menu-items/tools/actions/tools.actions';
import { selectSelectedLayersIds, selectLayers } from '../../menu-items/layers-manager/reducers/layers.reducer';
import { ClickOutsideService } from '../../core/click-outside/click-outside.service';
import { isDeleteKey } from '../../core/utils/keyboardKey';
import { isEqual } from 'lodash';
import { IImageProcParam, IOverlayStatusConfig, overlayStatusConfig } from './config/overlay-status-config';

@Component({
	selector: 'ansyn-overlay-status',
	templateUrl: './overlay-status.component.html',
	styleUrls: ['./overlay-status.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class OverlayStatusComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId: string;
	isAutoProcessing: boolean;
	isManualProcessing: boolean;
	moreButtons: boolean;
	overlay: IOverlay;
	isActiveMap: boolean;
	favoriteOverlays: IOverlay[];
	presetOverlays: IOverlay[];
	overlaysTranslationData: any;
	isFavorite: boolean;
	favoritesButtonText: string;
	isPreset: boolean;
	presetsButtonText: string;
	isDragged: boolean;
	isImageControlActive = false;
	draggedButtonText: string;
	isLayersVisible: boolean;
	isChanged: boolean;

	@AutoSubscription
	favoriteOverlays$: Observable<any[]> = this.store$.select(selectFavoriteOverlays).pipe(
		tap((favoriteOverlays) => {
			this.favoriteOverlays = favoriteOverlays;
			this.updateFavoriteStatus();
		})
	);

	@AutoSubscription
	active$ = combineLatest([this.store$.select(selectActiveMapId), this.store$.select(selectTranslationData)]).pipe(
		tap(([activeMapId, overlaysTranslationData]: [string, { [key: string]: ITranslationData }]) => {
			this.isActiveMap = activeMapId === this.mapId;
			this.overlaysTranslationData = overlaysTranslationData;
			this.updateDraggedStatus();
		})
	);

	@AutoSubscription
	onClickOutSide$ = this.clickOutsideService.onClickOutside({monitor: this.element.nativeElement}).pipe(
		filter(Boolean),
		tap( () => {
			this.moreButtons = false;
			this.isManualProcessing = false;
		})
	);

	@AutoSubscription
	annoatationModeChange$: any = this.actions$
		.pipe(
			ofType(ToolsActionsTypes.STORE.SET_ANNOTATION_MODE),
			tap((action: SetAnnotationMode) => {
				const useMapId = action.payload && Boolean(action.payload.mapId);
				if ((!useMapId || (useMapId && action.payload.mapId === this.mapId)) &&
					(Boolean(action.payload) && action.payload.annotationMode !== AnnotationMode.Translate &&
						action.payload.annotationMode !== null)) {
					if (this.isDragged) {
						this.toggleDragged();
					}
				}
			}));

	@AutoSubscription
	manualImageProcessingParams$: Observable<Object> = this.store$.select(overlayStatusStateSelector).pipe(
		map((overlayStatusState: IOverlayStatusState ) => overlayStatusState.manualImageProcessingParams),
		tap((imageManualProcessArgs) => {
			const defalutParms = {};
			this.overlayStatusConfig.ImageProcParams.forEach(obj => {
				const key = obj.name
				defalutParms[key] = obj.defaultValue
			});
			this.isChanged = !isEqual(defalutParms, imageManualProcessArgs) && !this.isAutoProcessing;
		})
	);

	constructor(@Inject(overlayStatusConfig) public overlayStatusConfig: IOverlayStatusConfig,
		public store$: Store<any>, protected actions$: Actions, protected element: ElementRef, protected clickOutsideService: ClickOutsideService) {
		this.isPreset = true;
		this.isFavorite = true;
	}

	@AutoSubscription
	layersVisibility$ = () => combineLatest([
		this.store$.select(selectSelectedLayersIds),
		this.store$.select(selectHideLayersOnMap(this.mapId)),
		this.store$.select(selectLayers)])
		.pipe(
			map(([selectedLayerIds, areLayersHidden, layers]) => {
				layers = layers.filter((currentLayer) =>
					Boolean(currentLayer.data) &&
					currentLayer.type === "Annotation" &&
					currentLayer.data.features.length > 0 &&
					selectedLayerIds.includes(currentLayer.id));
				return [areLayersHidden, layers];
			}),
			tap(([areLayersHidden, layers]) => {
				this.isLayersVisible = !((Boolean(areLayersHidden)) || (Boolean(layers.length === 0)));
				if (this.isDragged) {
					this.toggleDragged();
				}
			})
		);

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		tap(overlay => {
			if (this.isDragged) {
				this.toggleDragged();
			}
			this.overlay = overlay;
			this.onChangeOverlay();
		})
	);

	ngOnInit() {
	}

	ngOnDestroy(): void {
		if (this.isDragged) {
			this.toggleDragged();
		}
	}

	onChangeOverlay() {
		this.updateFavoriteStatus();
		this.updateDraggedStatus();
		this.resetButtons();
	}

	resetButtons() {
		this.moreButtons = false;
		this.isManualProcessing = false;
		this.isAutoProcessing = false;
	}

	updateFavoriteStatus() {
		this.isFavorite = false;
		if (this.overlay && this.favoriteOverlays && this.favoriteOverlays.length > 0) {
			this.isFavorite = this.favoriteOverlays.some(o => o.id === this.overlay.id);
		}
		this.favoritesButtonText = this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
	}

	toggleFavorite() {
		const overlay = this.overlay;
		const { id } = overlay;
		const value = !this.isFavorite;
		this.store$.dispatch(new ToggleFavoriteAction({ value, id, overlay }));
	}

	toggleDragged() {
		this.store$.dispatch(new ToggleDraggedModeAction({
			mapId: this.mapId,
			overlayId: this.overlay.id,
			dragged: !this.isDragged
		}));
		if (this.isDragged) {
			this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [SetAnnotationMode] }));
		}
	}

	getType(): string {
		return 'buttons';
	}

	private updateDraggedStatus() {
		this.isDragged = false;
		if (this.overlay && this.overlaysTranslationData && this.overlaysTranslationData[this.overlay.id]) {
			this.isDragged = this.overlaysTranslationData[this.overlay.id].dragged;
		}
		this.draggedButtonText = this.isDragged ? 'Stop Drag' : 'Start Drag';
	}

	get noGeoRegistration() {
		if (!this.overlay) {
			return false;
		}
		return this.overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered;
	}

	get onAutoImageProcessing() {
		return this.isAutoProcessing;
	}

	toggleManualImageProcessing() {
		this.isAutoProcessing = false;
		this.moreButtons = false;
		this.isManualProcessing = !this.isManualProcessing;
		this.store$.dispatch(new SetAutoImageProcessing({mapId: this.mapId}));
	}

	toggleAutoImageProcessing() {
		this.isAutoProcessing = !this.isAutoProcessing;
		this.isManualProcessing = false;
		this.store$.dispatch(new SetAutoImageProcessing({mapId: this.mapId}));
	}
}
