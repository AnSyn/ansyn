import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChangeMainLayer, IEntryComponent, selectMapTypeById } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService, IMapProviderConfig, IMapSource, MAP_PROVIDERS_CONFIG } from '@ansyn/imagery';
import { fromEvent } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
	selector: 'ansyn-imagery-change-map',
	templateUrl: './imagery-change-map.component.html',
	styleUrls: ['./imagery-change-map.component.less']
})
@AutoSubscriptions()
export class ImageryChangeMapComponent implements OnInit, OnDestroy, IEntryComponent {
	mapId: string;
	showPopup: boolean;
	currentSourceType: string;
	mapSources: IMapSource[];

	@AutoSubscription
	onClickOutside$ = fromEvent(window, 'click').pipe(
		filter(() => Boolean(this.showPopup)),
		tap((event: any) => {
			if (event.path && !event.path.includes(this.element.nativeElement)) {
				this.showPopup = false;
			}
		})
	);

	constructor(protected store$: Store<any>,
				protected communicator: ImageryCommunicatorService,
				protected element: ElementRef,
				protected logger: LoggerService,
				@Inject(MAP_PROVIDERS_CONFIG) protected mapProvidersConfig: IMapProviderConfig) {
	}

	@AutoSubscription
	mapTypeChange$ = () => this.store$.select(selectMapTypeById(this.mapId)).pipe(
		tap(mapType => {
			this.currentSourceType = this.mapProvidersConfig[mapType].defaultMapSource;
			this.mapSources = Object.values(this.mapProvidersConfig[mapType].sources);
		})
	);

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	togglePopup() {
		this.showPopup = !this.showPopup;
		if (this.showPopup) {
			this.logger.info(`change map open`);
		}
	}

	changeMap(type: string) {
		this.logger.info(`change map from ${this.currentSourceType} to ${type}`);
		this.currentSourceType = type;
		this.store$.dispatch(new ChangeMainLayer({
			id: this.mapId,
			sourceType: type
		}));
		this.showPopup = false;
	}


	getType(): string {
		return '';
	}

}
