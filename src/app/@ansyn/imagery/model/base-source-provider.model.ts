import { Store } from '@ngrx/store';
import { SetProgressBarAction } from '@ansyn/map-facade/actions/map.actions';
import { Injectable } from '@angular/core';
import { endTimingLog, startTimingLog } from '@ansyn/core/utils/logs/timer-logs';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';

@Injectable()
export abstract class BaseMapSourceProvider {

	messages = {
		all: 'Failed to load overlay',
		partial: 'Failed to load {{amount}} tiles',
		one: 'Failed to load a tile'
	};

	abstract mapType: string;

	abstract sourceType: string;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	protected createOrGetFromCache(metaData: any, mapId: string) {
		const id = `${this.sourceType}/${JSON.stringify(metaData)}`;

		const cacheLayers = this.cacheService.getLayerFromCache(id);
		if (cacheLayers.length) {
			return cacheLayers;
		}

		const layers = this.create(metaData, mapId);
		this.cacheService.addLayerToCache(id, layers);
		return layers;
	}

	protected abstract create(metaData: any, mapId: string): any[];

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.createOrGetFromCache(metaData, mapId);
		return Promise.resolve(layer);
	}

	monitorSource(source, mapId: string) {
		let isFirstLoad = true;

		let tilesCounter = {
			total: 0,
			success: 0,
			error: 0
		};

		// For it to be reset after every zoom load
		const resetCounterWhenDone = () => {
			if (tilesCounter.total === tilesCounter.success + tilesCounter.error) {
				tilesCounter.total = 0;
				tilesCounter.success = 0;
				tilesCounter.error = 0;

				endTimingLog(this.mapType);

				isFirstLoad = false;
				const communicator = this.imageryCommunicatorService.provide(mapId);
				if (communicator) {
					communicator.ActiveMap.mapObject.renderSync();
				}
			}

			const progress = tilesCounter.total ? (tilesCounter.success + tilesCounter.error) / tilesCounter.total : 1;

			this.store.dispatch(new SetProgressBarAction({ progress: progress * 100, mapId }));
		};

		source.once('tileloadstart', () => startTimingLog(this.mapType));

		source.on('tileloadstart', () => tilesCounter.total++);

		source.on('tileloadend', () => {
			tilesCounter.success++;
			resetCounterWhenDone();
		});

		source.on('tileloaderror', () => {
			tilesCounter.error++;

			let message;

			if (isFirstLoad && tilesCounter.error === tilesCounter.total) { // All of em, on first load
				message = this.messages.all;
			} else if (tilesCounter.error === 1) { // Only 1
				message = this.messages.one;
			} else { // More than 1, but not all
				message = this.messages.partial.replace('{{amount}}', String(tilesCounter.error));
			}

			this.store.dispatch(new SetToastMessageAction({
				toastText: message,
				showWarningIcon: true
			}));

			resetCounterWhenDone();
		});
	}
}
