import { CommunicatorEntity, BaseImageryPlugin } from '@ansyn/imagery';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import ImageLayer from 'ol/layer/image';
import { OpenLayersImageProcessing } from '@ansyn/plugins/openlayers/open-layers-map/image-processing/open-layers-image-processing';
import Raster from 'ol/source/raster';
import { Actions } from '@ngrx/effects';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { SetMapAutoImageProcessing, SetMapManualImageProcessing } from '@ansyn/map-facade';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/disabled-map/open-layers-disabled-map';


@Injectable()
export class ImageProcessingPlugin extends BaseImageryPlugin {
	static supported = [OpenlayersMapName, DisabledOpenLayersMapName];
	communicator: CommunicatorEntity;
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;

	onToggleImageProcessing$: Observable<any> = this.actions$
		.ofType<SetMapAutoImageProcessing>(MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING)
		.filter((action: SetMapAutoImageProcessing) => action.payload.mapId === this.mapId && this.isImageLayerAndImageProcessing())
		.do((action: SetMapAutoImageProcessing) =>  {
			this.setAutoImageProcessing(action.payload.toggleValue)
		});

	onSetManualImageProcessing$: Observable<any> = this.actions$
		.ofType<SetMapManualImageProcessing>(MapActionTypes.SET_MAP_MANUAL_IMAGE_PROCESSING)
		.filter((action: SetMapManualImageProcessing) => action.payload.mapId === this.mapId && this.isImageLayerAndImageProcessing())
		.do((action: SetMapManualImageProcessing) => {
			this.setManualImageProcessing(action.payload.processingParams);
		});


	constructor(public actions$: Actions) {
		super();
	}

	private isImageLayerAndImageProcessing(): boolean {
		return !(!this.imageLayer || !this._imageProcessing);
	}

	public init(communicator: CommunicatorEntity): void {
		super.init(communicator);
		this.initEffects();
	}

	get mapId(): string {
		return this.communicator && this.communicator.id;
	}

	onResetView(): Observable<boolean> {
		this._imageProcessing = new OpenLayersImageProcessing();
		const layers = this.communicator.ActiveMap.mapObject.getLayers();
		this.imageLayer = layers.array_.find((layer) => layer instanceof ImageLayer);
		if (this.imageLayer.getSource() instanceof Raster) {
			this._imageProcessing = new OpenLayersImageProcessing((<any>this.imageLayer).getSource());
		}

		return Observable.of(true);
	}

	public setAutoImageProcessing(shouldPerform: boolean): void {
		if (shouldPerform) {
			// the determine the order which by the image processing will occur
			const processingParams = {
				Histogram: { auto: true },
				Sharpness: { auto: true }
			};
			this._imageProcessing.processImage(processingParams);
		} else {
			this._imageProcessing.processImage(null);
		}
	}

	public setManualImageProcessing(processingParams: Object): void {
		this._imageProcessing.processImage(processingParams);
	}

	initEffects() {
		this.subscriptions.push(
			this.onToggleImageProcessing$.subscribe(),
			this.onSetManualImageProcessing$.subscribe()
		)
	}
}
