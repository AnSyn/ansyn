import { Component, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import {
	ReplaceMainLayer,
	IEntryComponent,
	selectMapTypeById,
	selectOverlayByMapId,
	selectSourceTypeById, selectIsMinimalistViewMode
} from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import {
	CommunicatorEntity,
	IMapProviderConfig,
	IMapSource,
	MAP_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import { filter, tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { LoggerService } from '../../../core/services/logger.service';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';

@Component({
	selector: 'ansyn-imagery-change-map',
	templateUrl: './imagery-change-map.component.html',
	styleUrls: ['./imagery-change-map.component.less'],
	providers: [ClickOutsideService]
})
@AutoSubscriptions()
export class ImageryChangeMapComponent implements OnInit, OnDestroy, IEntryComponent {
	mapId: string;
	overlayDisplay: boolean;
	showPopup: boolean;
	show: boolean;
	currentSourceType: string;
	mapSources: IMapSource[];
	communicator: CommunicatorEntity;

	@AutoSubscription
	isMinimalistViewMode$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		tap(isMinimalistViewMode => {
			this.show = !isMinimalistViewMode;
		})
	);

	constructor(protected store$: Store<any>,
				protected logger: LoggerService,
				protected clickOutsideService: ClickOutsideService,
				@Inject(MAP_PROVIDERS_CONFIG) protected mapProvidersConfig: IMapProviderConfig) {
	}

	@AutoSubscription
	onClickOutside$ = () => this.clickOutsideService.onClickOutside().pipe(
		filter((shouldCallback) => {
			return shouldCallback && this.showPopup;
		}),
		tap(this.togglePopup.bind(this))
	);

	@AutoSubscription
	onDisplayChange$ = () => this.store$.select(selectOverlayByMapId(this.mapId)).pipe(
		tap(overlay => {
			this.overlayDisplay = Boolean(overlay);
		})
	);

	@AutoSubscription
	mapTypeChange$ = () => this.store$.select(selectMapTypeById(this.mapId)).pipe(
		filter((mapType: string) => Boolean(mapType)),
		tap((mapType: string) => {
			this.currentSourceType = this.mapProvidersConfig[mapType].defaultMapSource;
			this.mapSources = this.mapProvidersConfig[mapType].sources;
		})
	);

	@AutoSubscription
	sourceTypeChange$ = () => this.store$.select(selectSourceTypeById(this.mapId)).pipe(
		tap(sourceType => this.currentSourceType = sourceType)
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
		if (this.currentSourceType !== type) {
			this.logger.info(`change map from ${ this.currentSourceType } to ${ type }`);
			this.store$.dispatch(new ReplaceMainLayer({id: this.mapId, sourceType: type}));
			this.showPopup = false;
		}
	}


	getType(): string {
		return '';
	}

}
