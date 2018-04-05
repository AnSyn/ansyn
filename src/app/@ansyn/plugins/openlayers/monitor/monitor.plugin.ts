import { BaseImageryPlugin } from '@ansyn/imagery';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { Injectable } from '@angular/core';
import { SetProgressBarAction } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map/models/projectable-raster';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';

@Injectable()
export class MonitorPlugin extends BaseImageryPlugin {
	static supported = [OpenlayersMapName, DisabledOpenLayersMapName];

	messages = {
		all: 'Failed to load overlay',
		partial: 'Failed to load {{amount}} tiles',
		one: 'Failed to load a tile'
	};

	constructor(protected store$: Store<any>) {
		super();
	}

	onInit(): void {
		this.monitorSource();
	}

	onResetView() {
		return super.onResetView()
			.do(this.monitorSource.bind(this));
	}

	getMainSource() {
		const layer = this.communicator.ActiveMap.mapObject.getLayers()
			.getArray().find(layer => layer.get('name') === 'main');

		if (!layer) {
			return;
		}

		let source = layer.getSource();

		if (source instanceof ProjectableRaster) {
			return (<ProjectableRaster>source).sources[0];
		}

		return source;
	}

	monitorSource() {
		const source = this.getMainSource(), mapId = this.mapId;
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
				isFirstLoad = false;
				this.communicator.ActiveMap.mapObject.renderSync();
			}

			const progress = tilesCounter.total ? (tilesCounter.success + tilesCounter.error) / tilesCounter.total : 1;

			this.store$.dispatch(new SetProgressBarAction({ progress: progress * 100, mapId }));
		};

		// source.once('tileloadstart', () => startTimingLog(this.mapType));

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

			this.store$.dispatch(new SetToastMessageAction({
				toastText: message,
				showWarningIcon: true
			}));

			resetCounterWhenDone();
		});
	}

}
