import { Component, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ChangeImageryMap, IEntryComponent } from '@ansyn/map-facade';
import { AutoSubscriptions } from 'auto-subscriptions';
import { get as _get } from 'lodash';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { CesiumMap, CesiumMapName } from '@ansyn/imagery-cesium';
import { take } from 'rxjs/operators';
import { CoreConfig } from '../../../core/models/core.config';
import { ICoreConfig } from '../../../core/models/core.config.model';

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
				protected communicators: ImageryCommunicatorService,
				@Inject(CoreConfig) public coreConfig: ICoreConfig) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	toggleMapDimentions() {
		if (this.selectedMap === DimensionMode.D2) {
			this.store$.dispatch(new ChangeImageryMap({ id: this.mapId, mapType: CesiumMapName }));
		} else if (this.selectedMap === DimensionMode.D3) {
			(<CesiumMap>this.communicators.provide(this.mapId).ActiveMap).set2DPosition().pipe(take(1)).subscribe((result) => {
				this.store$.dispatch(new ChangeImageryMap({ id: this.mapId, mapType: OpenlayersMapName }));
			})
		}
	}

	changeActiveMap(mapType: string) {
		this.store$.dispatch(new ChangeImageryMap({ id: this.mapId, mapType }));
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

	getType(): string {
		return '';
	}

	get moveToMap() {
		if (this.selectedMap === DimensionMode.D2) {
			return DimensionMode.D3;
		} else {
			return DimensionMode.D2;
		}
	}
}
