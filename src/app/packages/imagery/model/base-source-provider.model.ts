import { Store } from '@ngrx/store';
import { SetProgressBarAction } from '@ansyn/map-facade/actions/map.actions';
import { Inject, Injectable } from '@angular/core';
import { endTimingLog, startTimingLog } from '@ansyn/core/utils/logs/timer-logs';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { ToolsFlag } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { IImageryConfig } from '@ansyn/imagery/model/iimagery-config';
import { ConfigurationToken } from '@ansyn/imagery/configuration.token';

@Injectable()
export abstract class BaseMapSourceProvider {

	static sChacheSize = 1;
	static slayersCacheArray: Map<string, any> = new Map<string, any>();

	messages = {
		all: 'Failed to load overlay',
		partial: 'Failed to load {{amount}} tiles',
		one: 'Failed to load a tile'
	};

	abstract mapType: string;

	abstract sourceType: string;

	static getLayerFromCache(id: string) {
		return BaseMapSourceProvider.slayersCacheArray.get(id);
	}

	static addLayerToCache(id: string, layer: any) {
		if (BaseMapSourceProvider.slayersCacheArray.size >= BaseMapSourceProvider.sChacheSize) {
			const key = BaseMapSourceProvider.slayersCacheArray.keys().next();
			BaseMapSourceProvider.slayersCacheArray.delete(key.value);
		}
		BaseMapSourceProvider.slayersCacheArray.set(id, layer);
	}

	constructor(protected store: Store<any>, @Inject(ConfigurationToken) protected config: IImageryConfig) {
		BaseMapSourceProvider.sChacheSize = config.maxCachedLayers;
	}

	abstract create(metaData: any, mapId: string): any;

	createAsync(metaData: any, mapId: string): Promise<any> {
		return Promise.resolve();
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
