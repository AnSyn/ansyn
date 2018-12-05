import { SetToastMessageAction } from '@ansyn/core';
import { Store } from '@ngrx/store';
import TileSource from 'ol/source/Tile';
import { Observable } from 'rxjs';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { SetProgressBarAction } from '@ansyn/map-facade';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { ProjectableRaster } from '../open-layers-map/models/projectable-raster';
import { tap } from 'rxjs/operators';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store]
})
export class MonitorPlugin extends BaseImageryPlugin {
	source: TileSource;

	isFirstLoad: boolean;

	tilesCounter = {
		total: 0,
		success: 0,
		error: 0
	};

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
		return <Observable<boolean>>super.onResetView()
			.pipe(tap(this.monitorSource.bind(this)));
	}

	getMainSource(): TileSource {
		const layer = this.communicator.ActiveMap.mapObject.getLayers()
			.getArray().find(layer => layer.get('name') === 'main');

		if (!layer) {
			return;
		}

		let source = layer.getSource();

		if (source instanceof ProjectableRaster) {
			return <TileSource> (<ProjectableRaster>source).sources[0];
		}

		return <TileSource> source;
	}

	monitorSource() {
		this.killMonitorEvents();
		this.initMonitor();
		this.setMonitorEvents();
	}

	resetCounterWhenDone = () => {
		if (this.tilesCounter.total === this.tilesCounter.success + this.tilesCounter.error) {
			this.tilesCounter.total = 0;
			this.tilesCounter.success = 0;
			this.tilesCounter.error = 0;
			this.isFirstLoad = false;
			this.communicator.ActiveMap.mapObject.renderSync();
		}

		const progress = this.tilesCounter.total ? (this.tilesCounter.success + this.tilesCounter.error) / this.tilesCounter.total : 1;

		this.store$.dispatch(new SetProgressBarAction({ progress: progress * 100, mapId: this.mapId }));
	};

	tileLoadStart() {
		this.tilesCounter.total++;
	}

	tileLoadEnd() {
		this.tilesCounter.success++;
		this.resetCounterWhenDone();
	}

	tileLoadError() {
		this.tilesCounter.error++;

		let message;

		if (this.isFirstLoad && this.tilesCounter.error === this.tilesCounter.total) { // All of em, on first load
			message = this.messages.all;
		} else if (this.tilesCounter.error === 1) { // Only 1
			message = this.messages.one;
		} else { // More than 1, but not all
			message = this.messages.partial.replace('{{amount}}', String(this.tilesCounter.error));
		}

		this.store$.dispatch(new SetToastMessageAction({
			toastText: message,
			showWarningIcon: true
		}));

		this.resetCounterWhenDone();
	}

	initMonitor() {
		this.source = this.getMainSource();
		this.isFirstLoad = true;
		const total = 0, success = 0, error = 0;
		this.tilesCounter = { total, success, error };
	}

	setMonitorEvents() {
		if (this.source) {
			this.source.on('tileloadstart', this.tileLoadStart.bind(this));
			this.source.on('tileloadend', this.tileLoadEnd.bind(this));
			this.source.on('tileloaderror', this.tileLoadError.bind(this));
		}
	}

	killMonitorEvents() {
		if (this.source) {
			this.source.un('tileloadstart', this.tileLoadStart.bind(this));
			this.source.un('tileloadend', this.tileLoadEnd.bind(this));
			this.source.un('tileloaderror', this.tileLoadError.bind(this));
		}
	}

	dispose() {
		this.killMonitorEvents();
		super.dispose();
	}
}
