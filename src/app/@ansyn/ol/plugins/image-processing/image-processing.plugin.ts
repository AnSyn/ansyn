import { Observable, of } from 'rxjs';
import ImageLayer from 'ol/layer/Image';
import {
	BaseImageryPlugin,
	CommunicatorEntity,
	IMAGERY_BASE_MAP_LAYER,
	ImageryPlugin
} from '@ansyn/imagery';
import { OpenLayersImageProcessing } from './image-processing';
import { distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { Inject } from '@angular/core';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../../maps/openlayers-disabled-map/openlayers-disabled-map';
import { getDefaultImageProcParams, IImageProcessingData, IImageProcParam, ImageManualProcessArgs } from './model';
import { ProjectableRaster } from '../../maps/open-layers-map/models/projectable-raster';
import { IMAGE_PROCESS_ATTRIBUTE } from '../../mapSourceProviders/open-layers.map-source-provider';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: []
})
export class ImageProcessingPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;
	customMainLayer = null;
	mapLayerChangedSubscription;

	onInit() {
		super.onInit();
		this.mapLayerChangedSubscription = this.iMap.mapLayerChangedEventEmitter.pipe(
			tap(()=> {
				this.removeImageLayer();
			})
		).subscribe();
	}

	startImageProcessing(isAutoImageProcessingActive: boolean, imageManualProcessArgs: ImageManualProcessArgs) {
		const isImageProcessActive = this.isImageProcessActive(isAutoImageProcessingActive, imageManualProcessArgs);
		if (!isImageProcessActive) {
			this.removeImageLayer();
			return;
		}
		// else
		this.createImageLayer([isAutoImageProcessingActive, imageManualProcessArgs]);
		const hasRasterLayer = this.getExistingRasterLayer();
		if (Boolean(hasRasterLayer)) {
			// auto
			this.setAutoImageProcessing(isAutoImageProcessingActive);
			// manual
			if (!isAutoImageProcessingActive) {
				this._imageProcessing.processImage(imageManualProcessArgs);
			}
		}
	}

	params: Array<IImageProcParam>;

	constructor() {
		super();
		this.params = getDefaultImageProcParams();
	}

	defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam: IImageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	isImageProcessActive(isAutoImageProcessingActive: boolean, imageManualProcessArgs: ImageManualProcessArgs) {
		const defaultManualParams = this.defaultImageManualProcessArgs();
		const result = isAutoImageProcessingActive || (Boolean(imageManualProcessArgs) && !isEqual(defaultManualParams, imageManualProcessArgs));
		return result;
	}

	onResetView(): Observable<boolean> {
		this.setCustomMainLayer(null);
		return of(true).pipe(
			tap(() => this.recalculateManualImageProcessActive())
		);
	}

	recalculateManualImageProcessActive() {
		this._imageProcessing = new OpenLayersImageProcessing();
		// todo: add get new image settings from store
	}

	setCustomMainLayer(layer) {
		if (!isEqual(this.getMainLayer(), layer)) {
			this.removeImageLayer();
		}
		this.customMainLayer = layer;
	}

	getMainLayer(): any {
		const baseMapLayer = (<any>this.iMap).getLayerByName(IMAGERY_BASE_MAP_LAYER);
		const mainLayer = Boolean(baseMapLayer) ? baseMapLayer : this.communicator.ActiveMap.getMainLayer();
		return Boolean(this.customMainLayer) ? this.customMainLayer : mainLayer;
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

	createImageLayer([isAutoImageProcessingActive, imageManualProcessArgs]: [boolean, ImageManualProcessArgs]) {
		this.imageLayer = this.getExistingRasterLayer();
		if (this.imageLayer) {
			return;
		}

		const mainLayer = this.getMainLayer();
		const imageLayer = mainLayer.get(IMAGE_PROCESS_ATTRIBUTE);
		if (!imageLayer) {
			return;
		}

		this.communicator.ActiveMap.addLayer(imageLayer);
		this.imageLayer = imageLayer;
		this.imageLayer.setZIndex(0);
		this._imageProcessing = new OpenLayersImageProcessing(<any>this.imageLayer.getSource());
	}

	removeImageLayer(): void {
		this.imageLayer = this.getExistingRasterLayer();
		if (this.imageLayer) {
			this.communicator.ActiveMap.removeLayer(this.imageLayer);
			this._imageProcessing = new OpenLayersImageProcessing();
			this.imageLayer = null;
		}
	}

	getExistingRasterLayer(): ImageLayer {
		const layers = this.communicator.ActiveMap.getLayers();
		const imageLayer = layers.find((layer) => {
			if (layer.type && layer.type === 'IMAGE') { // for component
				const source = layer.getSource();
				return source instanceof ProjectableRaster;
			}
			return false;
		});
		return imageLayer;
	}

	onDispose() {
		if (this.mapLayerChangedSubscription) {
			this.mapLayerChangedSubscription.unsubscribe();
			this.mapLayerChangedSubscription = null;
		}
		super.onDispose();
	}
}
