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
import { tap, withLatestFrom } from 'rxjs/operators';
import { IOverlay } from '../models/overlay.model';
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
import { selectAnnotationMode } from '../../menu-items/tools/reducers/tools.reducer';

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
	noGeoRegistration: any;
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
	draggedMode$: Observable<any> = this.store$.select(selectTranslationData).pipe(
		tap((overlaysTranslationData) => {
			this.overlaysTranslationData = overlaysTranslationData;
			this.updateDraggedStatus();
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
	active$ = combineLatest(this.store$.select(selectActiveMapId), this.store$.select(selectAnnotationMode)).pipe(
		// map((activeMapId) => ),
		tap(([activeMapId, annotationMode]: [string, AnnotationMode]) => {
			this.isActiveMap = activeMapId === this.mapId;
			if (annotationMode !== AnnotationMode.Translate) {
				if (this.isDragged) {
					this.toggleDragged();
				}
			}
		})
	);

	constructor(public store$: Store<any>) {
		this.isPreset = true;
		this.isFavorite = true;
	}

	@AutoSubscription
	layersVisibility$: () => Observable<boolean> = () => this.store$.select(selectHideLayersOnMap(this.mapId)).pipe(
		tap((isLayersHidden) => {
			this.isLayersVisible = !Boolean(isLayersHidden);
			if (this.isDragged) {
				this.toggleDragged();
			}
		})
	);

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		tap(overlay => {
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
		this.store$.dispatch(new ToggleDraggedModeAction({ overlayId: this.overlay.id, dragged: !this.isDragged }))
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
}
