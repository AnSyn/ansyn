import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { ChangeImageryMap, IEntryComponent } from "@ansyn/map-facade";
import { AutoSubscriptions } from "auto-subscriptions";
import { get as _get } from "lodash";
import { Store } from "@ngrx/store";
import { ImageryCommunicatorService } from "@ansyn/imagery";
import { DisabledOpenLayersMapName, OpenlayersMapName } from "@ansyn/ol";
import { CesiumMapName } from "@ansyn/imagery-cesium";

export enum DimensionMode {
	D2 = '2D',
	D3 = '3D',
	NA = 'NA'
}

@Component({
	selector: 'ansyn-imagery-dimension-mode',
	templateUrl: './imagery-dimension-mode.component.html',
	styleUrls: ['./imagery-dimension-mode.component.less']
})
@AutoSubscriptions()
export class ImageryDimensionModeComponent implements OnInit, OnDestroy, IEntryComponent {

	@HostBinding('hidden') hidden = false;

	mode: string;
	@Input() mapId: string;

	constructor(protected store$: Store<any>,
				protected communicators: ImageryCommunicatorService) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	toggleMapDimentions() {
		if (this.selectedMap === DimensionMode.D2) {
			this.store$.dispatch(new ChangeImageryMap({id: this.mapId, mapType: CesiumMapName}));
		} else if (this.selectedMap === DimensionMode.D3) {
			this.store$.dispatch(new ChangeImageryMap({id: this.mapId, mapType: OpenlayersMapName}));
		}
	}

	changeActiveMap(mapType: string) {
		this.store$.dispatch(new ChangeImageryMap({id: this.mapId, mapType}));
	}

	get selectedMap() {
		const activeMapType = _get(this.communicators.provide(this.mapId), 'ActiveMap.mapType');
		if (activeMapType === DisabledOpenLayersMapName || activeMapType === OpenlayersMapName) {
			return DimensionMode.D2;
		} else if (activeMapType === CesiumMapName) {
			return DimensionMode.D3;
		}
		return DimensionMode.NA;
	}

	get moveToMap() {
		if (this.selectedMap === DimensionMode.D2 ) {
			return DimensionMode.D3;
		} else {
			return DimensionMode.D2;
		}
	}
}
