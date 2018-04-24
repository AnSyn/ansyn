import { BaseImageryPlugin } from '@ansyn/imagery';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { Injectable } from '@angular/core';
import { SetProgressBarAction } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map/models/projectable-raster';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import TileSource from 'ol/source/tile';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MonitorPlugin extends BaseImageryPlugin {
	static supported = [OpenlayersMapName, DisabledOpenLayersMapName];

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
			.do(this.monitorSource.bind(this));
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
			this.source.on('tileloadstart', this.tileLoadStart, this);
			this.source.on('tileloadend', this.tileLoadEnd, this);
			this.source.on('tileloaderror', this.tileLoadError, this);
		}
	}

	killMonitorEvents() {
		if (this.source) {
			this.source.un('tileloadstart', this.tileLoadStart, this);
			this.source.un('tileloadend', this.tileLoadEnd, this);
			this.source.un('tileloaderror', this.tileLoadError, this);
		}
	}

	dispose() {
		this.killMonitorEvents();
		super.dispose();
	}
}
