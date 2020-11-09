import { Observable, of } from 'rxjs';
import ImageLayer from 'ol/layer/Image';
import RasterSource from 'ol/source/Raster';
import { BaseImageryPlugin, CommunicatorEntity, ImageryPlugin, IMapSettings } from '@ansyn/imagery';
import { Store, select } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import {
	OpenLayersDisabledMap,
	OpenLayersMap
} from '@ansyn/ol';
import { OpenLayersImageProcessing } from './image-processing';
import { distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { Inject } from '@angular/core';
import { selectMaps } from '@ansyn/map-facade';
import { IImageManualProcessArgs } from '../../../../menu-items/cases/models/case.model';
import {
	IImageProcParam,
	IOverlayStatusConfig,
	overlayStatusConfig
} from "../../../../overlays/overlay-status/config/overlay-status-config";

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store, overlayStatusConfig]
})
export class ImageProcessingPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;
	// customMainLayer = null;

	isImageProcessActive$ = this.store$.pipe(
		select(selectMaps),
		map( maps => maps && maps[this.mapId]),
		distinctUntilChanged((a, b) => {
			return isEqual(a, b);
		}),
		filter(Boolean),
		map( (map: IMapSettings) => {
			return [map.data.isAutoImageProcessingActive, map.data.imageManualProcessArgs]
		})
	);

	@AutoSubscription
	onAutoImageProcessingAndManualImageProcessActive$ = this.isImageProcessActive$.pipe(
		tap(([isAutoImageProcessingActive, imageManualProcessArgs]: [boolean, IImageManualProcessArgs]) => {
			const isImageProcessActive = this.isImageProcessActive(isAutoImageProcessingActive, imageManualProcessArgs);
			if (!isImageProcessActive) {
				this.removeImageLayer();
				return;
			}
			this.createImageLayer();
			if (Boolean(this.imageLayer)) {
				// auto
				this.setAutoImageProcessing(isAutoImageProcessingActive);
				// manual
				if (!isAutoImageProcessingActive) {
					this._imageProcessing.processImage(this.communicator.mapSettings.data.imageManualProcessArgs);
				}
			}
		})
	);

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	constructor(public store$: Store<any>, @Inject(overlayStatusConfig) protected config: IOverlayStatusConfig) {
		super();
	}

	defaultImageManualProcessArgs(): IImageManualProcessArgs {
		return this.params.reduce<IImageManualProcessArgs>((initialObject: any, imageProcParam: IImageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	isImageProcessActive(isAutoImageProcessingActive: boolean, imageManualProcessArgs: IImageManualProcessArgs) {
		const defaultManualParams = this.defaultImageManualProcessArgs();
		const result = isAutoImageProcessingActive || (Boolean(imageManualProcessArgs) && !isEqual(defaultManualParams, imageManualProcessArgs));
		return result;
	}

	onResetView(): Observable<boolean> {
		// this.setCustomMainLayer(null);
		return of(true).pipe(
			tap(() => this.recalculateManualImageProcessActive())
		);
	}

	recalculateManualImageProcessActive() {
		this._imageProcessing = new OpenLayersImageProcessing();
		this.onAutoImageProcessingAndManualImageProcessActive$.pipe(take(1)).subscribe();
	}

	/*setCustomMainLayer(layer) {
		if (!isEqual(this.getMainLayer(), layer)) {
			this.removeImageLayer();
		}
		this.customMainLayer = layer;
	}*/

	getMainLayer(): any {
		return /*Boolean(this.customMainLayer) ? this.customMainLayer :*/ this.communicator.ActiveMap.getMainLayer();
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

	createImageLayer() {
		if (this.imageLayer) {
			return;
		}
		const mainLayer = this.getMainLayer();
		const extent = mainLayer.getExtent();
		const source = mainLayer.getSource();
		this.imageLayer = new ImageLayer({
			source: new RasterSource({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			}),
			extent: extent
		});

		this.communicator.ActiveMap.addLayer(this.imageLayer);
		this.imageLayer.setZIndex(0);
		this._imageProcessing = new OpenLayersImageProcessing(<any>this.imageLayer.getSource());
	}

	removeImageLayer(): void {
		if (this.imageLayer) {
			this.imageLayer.getSource().dispose();
			this.communicator.ActiveMap.removeLayer(this.imageLayer);
			this._imageProcessing = new OpenLayersImageProcessing();
			this.imageLayer = null;
		}
	}

}
