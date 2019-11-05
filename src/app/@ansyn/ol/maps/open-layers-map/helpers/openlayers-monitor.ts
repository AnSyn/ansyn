import TileSource from 'ol/source/Tile';
import { IMAGERY_MAIN_LAYER_NAME, ImageryLayerProperties, IMapErrorMessage, IMapProgress } from '@ansyn/imagery';
import Static from 'ol/source/ImageStatic';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import OLMap from 'ol/Map';
import { ProjectableRaster } from '../models/projectable-raster';
import { EventEmitter } from '@angular/core';

export class OpenLayersMonitor {
	source: TileSource | Static | any;

	isFirstLoad: boolean;

	tilesCounter = {
		total: 0,
		success: 0,
		error: 0
	};

	messages = {
		all: 'Failed to load overlay',
		partial: 'Failed to load {amount} tiles',
		one: 'Failed to load a tile'
	};

	olmap: OLMap;

	constructor(protected tilesLoadProgressEventEmitter: EventEmitter<IMapProgress>,
				protected tilesLoadErrorEventEmitter: EventEmitter<IMapErrorMessage>,
				protected http: HttpClient
	) {
	}

	start(olmap: OLMap) {
		this.olmap = olmap;
		this.monitorSource();
	}

	getMainSource(): TileSource | Static | any {
		const layer = this.olmap.getLayers()
			.getArray().find(layer => layer.get(ImageryLayerProperties.NAME) === IMAGERY_MAIN_LAYER_NAME);

		if (!layer) {
			return;
		}

		let source = layer.getSource();

		if (source instanceof ProjectableRaster) {
			return (<ProjectableRaster>source).sources[0];
		}
		if (source instanceof Static) {
			return <Static>source;
		}
		return source;
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
			this.olmap.renderSync();
		}

		const progress = this.tilesCounter.total ? (this.tilesCounter.success + this.tilesCounter.error) / this.tilesCounter.total : 1;

		this.tilesLoadProgressEventEmitter.emit({ progress: progress * 100 });
	};

	tileLoadStart = () => {
		this.tilesCounter.total++;
	};

	tileLoadEnd = () => {
		this.tilesCounter.success++;
		this.resetCounterWhenDone();
	};

	tileLoadError = () => {
		this.tilesCounter.error++;

		let message;

		if (this.isFirstLoad && this.tilesCounter.error === this.tilesCounter.total) { // All of em, on first load
			message = this.messages.all;
		} else if (this.tilesCounter.error === 1) { // Only 1
			message = this.messages.one;
		} else { // More than 1, but not all
			message = this.messages.partial.replace('{amount}', String(this.tilesCounter.error));
		}

		this.tilesLoadErrorEventEmitter.emit({ message });

		this.resetCounterWhenDone();
	};


	initMonitor() {
		this.source = this.getMainSource();
		this.isFirstLoad = true;
		const total = 0, success = 0, error = 0;
		this.tilesCounter = { total, success, error };
	}

	setMonitorEvents() {
		if (this.source) {
			if (this.source instanceof TileSource) {
				this.source.on('tileloadstart', this.tileLoadStart);
				this.source.on('tileloadend', this.tileLoadEnd);
				this.source.on('tileloaderror', this.tileLoadError);
			} else if (this.source instanceof Static) {
				const image = this.source.image_.image_;
				const src = this.source.image_.src_;
				this.staticImageLoad(image, src);
			} else {
				console.warn(`'${ this.source } is not supported by monitor plugin'`);
			}
		}
	}

	killMonitorEvents() {
		if (this.source) {
			if (this.source instanceof TileSource) {
				this.source.un('tileloadstart', this.tileLoadStart);
				this.source.un('tileloadend', this.tileLoadEnd);
				this.source.un('tileloaderror', this.tileLoadError);
			}
		}
	}

	dispose() {
		this.killMonitorEvents();
	}

	staticImageLoad = (image: any, url) => {
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
		});
	};
}
