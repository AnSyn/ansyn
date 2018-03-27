import { CommunicatorEntity, IMap, BaseImageryPlugin } from '@ansyn/imagery';
import Vector from 'ol/source/vector';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Style from 'ol/style/style';
import Icon from 'ol/style/icon';
import VectorLayer from 'ol/layer/vector';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { EventEmitter, Injectable } from '@angular/core';
import { OpenlayersMapComponent } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map.component';
import { Observable } from 'rxjs/Observable';
import { ImageryComponentManager } from "@ansyn/imagery/imagery/manager/imagery.component.manager";
import ImageLayer from "ol/layer/image";
import { OpenLayersImageProcessing } from "@ansyn/plugins/openlayers/open-layers-map/image-processing/open-layers-image-processing";


@Injectable()
export class ImageProcessingPlugin extends BaseImageryPlugin {
	static mapName = OpenlayersMapComponent.mapName;
	private _iconStyle: Style;
	private _existingLayer;
	private _imageProcessing: OpenLayersImageProcessing;



	constructor() {
		super();


	}

	public init(communicator: CommunicatorEntity): void {
		super.init(communicator);
	}

	onResetView(): Observable<boolean> {
		// dispose old imageProcessing
		// 1. find if raster layer exists
		// 2. if exists
		// initialize new _imageProcessing
		// 3. if not - do nothing
		//
		return Observable.of(true);
	}

	public setAutoImageProcessing(shouldPerform: boolean): void {
		const layers = this.communicator.ActiveMap.mapObject.getLayers();
		let imageLayer: ImageLayer = layers.array_.find((layer) => layer instanceof ImageLayer);
		if (!imageLayer || !this._imageProcessing) {
			return;
		}
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
		let imageLayer: ImageLayer = this.communicator.ActiveMap.mapObject.find((layer) => layer instanceof ImageLayer);
		if (!imageLayer || !this._imageProcessing) {
			return;
		}
		this._imageProcessing.processImage(processingParams);
	}
}
