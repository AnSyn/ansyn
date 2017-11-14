import { SetToastMessageStoreAction } from '../../status-bar/actions/status-bar.actions';
import { Store } from '@ngrx/store';
import { SetProgressBarAction } from '../../map-facade/actions/map.actions';

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
			}

			const progress = tilesCounter.total ? (tilesCounter.success + tilesCounter.error ) / tilesCounter.total : 1;

			this.store.dispatch(new SetProgressBarAction({progress, mapId}));
		};

		source.on('tileloadstart', () => {
			tilesCounter.total++;
		});

		source.on('tileloadend', () => {
			tilesCounter.success++;
			resetCounterWhenDone();
		});

		source.on('tileloaderror', () => {
			tilesCounter.error++;

			let message;
			switch (tilesCounter.error) {
				case tilesCounter.total:
					message = 'Failed to load overlay';
					break;
				case 1:
					message = 'Failed to load a tile';
					break;
				default:
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
