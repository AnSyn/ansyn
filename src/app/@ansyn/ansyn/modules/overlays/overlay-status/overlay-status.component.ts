import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import {
	IEntryComponent,
	selectActiveMapId,
	selectHideLayersOnMap,
	selectMapsTotal,
	selectOverlayByMapId,
} from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { GeoRegisteration, IOverlay } from '../models/overlay.model';
import {
	SetRemovedOverlaysIdAction,
	ToggleDraggedModeAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from './actions/overlay-status.actions';
import {
	selectFavoriteOverlays,
	selectPresetOverlays,
	selectRemovedOverlays,
	selectTranslationData
} from './reducers/overlay-status.reducer';
import { AnnotationMode } from '@ansyn/ol';
import { ITranslationData } from '../../menu-items/cases/models/case.model';
import { Actions, ofType } from '@ngrx/effects';
import { SetAnnotationMode, ToolsActionsTypes, ClearActiveInteractionsAction } from '../../menu-items/tools/actions/tools.actions';
import { selectSelectedLayersIds, selectLayers } from '../../menu-items/layers-manager/reducers/layers.reducer';

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
	mapsAmount = 1;
	overlay: IOverlay;
	isActiveMap: boolean;
	favoriteOverlays: IOverlay[];
	removedOverlaysIds: string[] = [];
	presetOverlays: IOverlay[];
	overlaysTranslationData: any;
	isFavorite: boolean;
	favoritesButtonText: string;
	isPreset: boolean;
	presetsButtonText: string;
	isRemoved: boolean;
	isDragged: boolean;
	draggedButtonText: string;
	isLayersVisible: boolean;

	@AutoSubscription
	mapsAmount$: Observable<number> = this.store$.pipe(
		select(selectMapsTotal),
		tap((mapsAmount) => this.mapsAmount = mapsAmount)
	);

	@AutoSubscription
	favoriteOverlays$: Observable<any[]> = this.store$.select(selectFavoriteOverlays).pipe(
		tap((favoriteOverlays) => {
			this.favoriteOverlays = favoriteOverlays;
			this.updateFavoriteStatus();
		})
	);
	@AutoSubscription
	presetOverlays$: Observable<any[]> = this.store$.select(selectPresetOverlays).pipe(
		tap((presetOverlays) => {
			this.presetOverlays = presetOverlays;
			this.updatePresetStatus();
		})
	);

	@AutoSubscription
	removedOverlays$: Observable<string[]> = this.store$.select(selectRemovedOverlays).pipe(
		tap((removedOverlaysIds) => {
			this.removedOverlaysIds = removedOverlaysIds;
			this.updateRemovedStatus();
		})
	);

	@AutoSubscription
	active$ = combineLatest(this.store$.select(selectActiveMapId), this.store$.select(selectTranslationData)).pipe(
		tap(([activeMapId, overlaysTranslationData]: [string, { [key: string]: ITranslationData }]) => {
			this.isActiveMap = activeMapId === this.mapId;
			this.overlaysTranslationData = overlaysTranslationData;
			this.updateDraggedStatus();
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

	constructor(public store$: Store<any>, protected actions$: Actions) {
		this.isPreset = true;
		this.isFavorite = true;
	}

	@AutoSubscription
	layersVisibility$ = () => combineLatest(
			this.store$.select(selectSelectedLayersIds),
			this.store$.select(selectHideLayersOnMap(this.mapId)),
			this.store$.select(selectLayers))
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

	@HostListener('window:keydown', ['$event'])
	deleteKeyPressed($event: KeyboardEvent) {
		if (this.isActiveMap && this.overlay && $event.which === 46 && !this.isRemoved) {
			this.removeOverlay();
		}
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		if (this.isDragged) {
			this.toggleDragged();
		}
	}

	onChangeOverlay() {
		this.updateRemovedStatus();
		this.updatePresetStatus();
		this.updateFavoriteStatus();
		this.updateDraggedStatus();
	}

	updateFavoriteStatus() {
		this.isFavorite = false;
		if (this.overlay && this.favoriteOverlays && this.favoriteOverlays.length > 0) {
			this.isFavorite = this.favoriteOverlays.some(o => o.id === this.overlay.id);
		}
		this.favoritesButtonText = this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
	}

	updatePresetStatus() {
		this.isPreset = false;
		if (this.overlay && this.presetOverlays && this.presetOverlays.length > 0) {
			this.isPreset = this.presetOverlays.some(o => o.id === this.overlay.id);
		}
		this.presetsButtonText = this.isPreset ? 'Remove from overlays quick loop' : 'Add to overlays quick loop';
	}

	updateRemovedStatus() {
		this.isRemoved = this.removedOverlaysIds.includes(this.overlay && this.overlay.id);
	}

	toggleFavorite() {
		const overlay = this.overlay;
		const { id } = overlay;
		const value = !this.isFavorite;
		this.store$.dispatch(new ToggleFavoriteAction({ value, id, overlay }));
	}

	togglePreset() {
		const overlay = this.overlay;
		const { id } = overlay;
		const value = !this.isPreset;
		this.store$.dispatch(new TogglePresetOverlayAction({ value, id, overlay }));

	}

	toggleDragged() {
		this.store$.dispatch(new ToggleDraggedModeAction({
			mapId: this.mapId,
			overlayId: this.overlay.id,
			dragged: !this.isDragged
		}))
		if (this.isDragged) {
			this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [SetAnnotationMode] }));
		}
	}

	removeOverlay() {
		this.store$.dispatch(new SetRemovedOverlaysIdAction({
			mapId: this.mapId,
			id: this.overlay.id,
			value: !this.isRemoved

		}))
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
}
