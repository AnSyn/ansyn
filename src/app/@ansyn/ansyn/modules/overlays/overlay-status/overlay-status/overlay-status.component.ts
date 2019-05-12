import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import {
	BackToWorldView,
	IEntryComponent,
	selectActiveMapId,
	selectFavoriteOverlays,
	selectMaps,
	selectMapsTotal,
	selectPresetOverlays,
	selectRemovedOverlays,
	SetRemovedOverlaysIdAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from "@ansyn/map-facade";
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
	_mapId: string;
	mapsAmount = 1;
	overlay: any;
	isActiveMap: boolean;
	favoriteOverlays: any[];
	removedOverlaysIds = [];
	presetOverlays: any[];
	isFavorite: any;
	favoritesButtonText: any;
	isPreset: any;
	noGeoRegistration: any;
	presetsButtonText: any;
	isRemoved: any;

	@Input()
	set mapId(value: string) {
		this._mapId = value;
	}

	get mapId() {
		return this._mapId;
	}

	@AutoSubscription
	mapsAmount$ = this.store$.pipe(
		select(selectMapsTotal),
		tap((mapsAmount) => this.mapsAmount = mapsAmount)
	);

	@AutoSubscription
	overlay$ = this.store$.pipe(
		select(selectMaps),
		tap((maps) => {
			if (maps[this.mapId]) {
				this.overlay = maps[this.mapId].data.overlay;
				console.log({overlay: this.overlay})
			}
			this.updateRemovedStatus();
			this.updateFavoriteStatus();
			this.updatePresetStatus();
		})
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
	active$ = this.store$.pipe(
		select(selectActiveMapId),
		map((activeMapId) => activeMapId === this.mapId),
		tap((isActiveMap) => this.isActiveMap = isActiveMap)
	);


	constructor(public store$: Store<any>) {
		this.isPreset = true;
		this.isFavorite = true;
	}

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

	backToWorldView() {
		this.store$.dispatch(new BackToWorldView({mapId: this.mapId}));
	}

	toggleFavorite() {
		const overlay = this.overlay;
		const {id} = overlay;
		const value = !this.isFavorite;
		this.store$.dispatch(new ToggleFavoriteAction({value, id, overlay}));
	}

	togglePreset() {
		const overlay = this.overlay;
		const {id} = overlay;
		const value = !this.isPreset;
		this.store$.dispatch(new TogglePresetOverlayAction({value, id, overlay}));

	}

	removeOverlay() {
		this.store$.dispatch(new SetRemovedOverlaysIdAction({
			mapId: this.mapId,
			id: this.overlay.id,
			value: !this.isRemoved

		}))
	}
}
