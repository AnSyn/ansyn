import { SetToastMessageStoreAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { Store } from '@ngrx/store';
import { SetProgressBarAction } from '@ansyn/map-facade/actions/map.actions';
import { Injectable } from '@angular/core';
import { endTimingLog, startTimingLog } from '@ansyn/core/utils/logs/timer-logs';

@Injectable()
export abstract class BaseMapSourceProvider {

	abstract mapType: string;

	abstract sourceType: string;

	constructor(protected store: Store<any>) {
	}

	abstract create(metaData: any, mapId: string): any;

	createAsync(metaData: any, mapId: string): Promise<any> {
		return Promise.resolve();
	}

	monitorSource(source, mapId: string) {
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
			}

			const progress = tilesCounter.total ? (tilesCounter.success + tilesCounter.error) / tilesCounter.total : 1;

			this.store.dispatch(new SetProgressBarAction({ progress, mapId }));
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
			switch (tilesCounter.error) { // How many tiles errored?
				case tilesCounter.total: // All of em
					message = 'Failed to load overlay';
					break;
				case 1: // Only 1
					message = 'Failed to load a tile';
					break;
				default: // More than 1, but not all
					message = 'Failed to load ' + tilesCounter.error + ' tiles';
			}

			this.store.dispatch(new SetToastMessageStoreAction({
				toastText: message,
				showWarningIcon: true
			}));

			resetCounterWhenDone();
		});
	}
}
