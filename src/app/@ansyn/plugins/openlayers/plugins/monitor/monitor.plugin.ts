import { SetToastMessageAction } from '@ansyn/core';
import { Store } from '@ngrx/store';
import TileSource from 'ol/source/tile';
import { Observable } from 'rxjs';
import { BaseImageryPlugin, IMAGERY_MAIN_LAYER_NAME, ImageryLayerProperties, ImageryPlugin } from '@ansyn/imagery';
import Static from 'ol/source/imagestatic';
import { SetProgressBarAction } from '@ansyn/map-facade';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../../maps/openlayers-disabled-map/openlayers-disabled-map';
import { ProjectableRaster } from '../../maps/open-layers-map/models/projectable-raster';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store, HttpClient]
})
export class MonitorPlugin extends BaseImageryPlugin {
	source: TileSource | Static | any;

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

	constructor(protected store$: Store<any>,
				protected http: HttpClient) {
		super();
	}

	onInit(): void {
		this.monitorSource();
	}

	onResetView() {
		return <Observable<boolean>>super.onResetView()
			.pipe(tap(this.monitorSource.bind(this)));
	}

	getMainSource(): TileSource | Static | any {
		const layer = this.communicator.ActiveMap.backgroundMapObject.getLayers()
			.getArray().find(layer => layer.get(ImageryLayerProperties.NAME) === IMAGERY_MAIN_LAYER_NAME);

		if (!layer) {
			return;
		}

		let source = layer.getSource();

		if (source instanceof ProjectableRaster) {
			return <TileSource>(<ProjectableRaster>source).sources[0];
		}
		if (source instanceof Static) {
			return <Static>source;
		}
		return <TileSource>source;
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
			if (this.source instanceof TileSource) {
				this.source.on('tileloadstart', this.tileLoadStart, this);
				this.source.on('tileloadend', this.tileLoadEnd, this);
				this.source.on('tileloaderror', this.tileLoadError, this);
			} else if (this.source instanceof Static) {
				const image = this.source.getProperties().image_.image_; // ?
				const src = this.source.getProperties().image_.src_; // ?
				this.staticImageLoad(image, src);
			}
		}
	}

	killMonitorEvents() {
		if (this.source) {
			if (this.source instanceof TileSource) {
				this.source.un('tileloadstart', this.tileLoadStart, this);
				this.source.un('tileloadend', this.tileLoadEnd, this);
				this.source.un('tileloaderror', this.tileLoadError, this);
			}
		}
	}

	dispose() {
		this.killMonitorEvents();
		super.dispose();
	}

	staticImageLoad = (image: ol.Image, url) => {
		this.http.request<Blob>(new HttpRequest(
			'GET',
			url,
			{
				reportProgress: true,
				responseType: 'blob'
			}
			)
		).subscribe(event => {
			switch (event.type) {
				case HttpEventType.DownloadProgress:
				case HttpEventType.UploadProgress: {
					this.tilesCounter.total = event.total;
					this.tilesCounter.success = event.loaded;
					this.resetCounterWhenDone();
					break;
				}
				case HttpEventType.Response: {
					let reader = new FileReader();
					reader.readAsDataURL(event.body);
					reader.onloadend = () => {
						(<any>image).src = reader.result;
					};
					break;
				}
			}
		})
	}
}
