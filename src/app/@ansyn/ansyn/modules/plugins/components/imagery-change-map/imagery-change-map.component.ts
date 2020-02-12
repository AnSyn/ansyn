import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChangeMainLayer, IEntryComponent, selectMapTypeById } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import {
	OpenLayerBingSourceProviderSourceType,
	OpenLayerMarcoSourceProviderSourceType,
	OpenlayersMapName
} from '@ansyn/ol';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { OpenLayerESRI_4326SourceProviderSourceType } from '../../../../../ol/mapSourceProviders/open-layers-ESRI-4326-source-provider';
import { fromEvent } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { CesiumBingSourceProviderSourceType, CesiumMapName } from '@ansyn/imagery-cesium';
import { BaseMapProvidersService } from '../../services/base-map-providers.service';

@Component({
	selector: 'ansyn-imagery-change-map',
	templateUrl: './imagery-change-map.component.html',
	styleUrls: ['./imagery-change-map.component.less']
})
@AutoSubscriptions()
export class ImageryChangeMapComponent implements OnInit, OnDestroy, IEntryComponent {
	mapId: string;
	showPopup: boolean;
	@AutoSubscription
	onClickOutside$ = fromEvent(window, 'click').pipe(
		filter(() => Boolean(this.showPopup)),
		tap((event: any) => {
			if ((event.path && !event.path.includes(this.element.nativeElement))) {
				this.showPopup = false;
			}
		})
	);

	@AutoSubscription
	mapTypeChange$ = () => this.store$.select(selectMapTypeById(this.mapId)).pipe(
		map( mapType => this.baseMapProviders.getAllBaseMap(mapType))
	);
	constructor(protected store$: Store<any>,
				protected communicator: ImageryCommunicatorService,
				protected element: ElementRef,
	protected baseMapProviders: BaseMapProvidersService) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	togglePopup() {
		this.showPopup = !this.showPopup;
	}

	changeMap(map: string, type: string) {
		this.store$.dispatch(new ChangeMainLayer({
			id: this.mapId,
			sourceType: type
		}))
	}


	getType(): string {
		return '';
	}

}
