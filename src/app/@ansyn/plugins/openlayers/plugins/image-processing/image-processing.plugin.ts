import { combineLatest, Observable, of } from 'rxjs';
import ImageLayer from 'ol/layer/image';
import { BaseImageryPlugin, CommunicatorEntity, ImageryPlugin } from '@ansyn/imagery';
import { ICaseMapState, ImageManualProcessArgs } from '@ansyn/core';
import { IMapState, MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersDisabledMap } from '../../mapSourceProviders/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '../../mapSourceProviders/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersImageProcessing } from './image-processing';
import { distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { IImageProcParam, IToolsConfig, toolsConfig } from '@ansyn/menu-items';
import { isEqual } from 'lodash';
import { Inject } from '@angular/core';
import { ProjectableRaster } from '../../mapSourceProviders/open-layers-map/models/projectable-raster';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store, toolsConfig]
})
export class ImageProcessingPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;
	customMainLayer = null;

	currentMap$ = this.store$.select(mapStateSelector).pipe(
		map((mapState: IMapState) => MapFacadeService.mapById(mapState.mapsList, this.mapId)),
		filter(Boolean)
	);

	isAutoImageProcessingActive$ = this.currentMap$.pipe(
		map((currentMap: ICaseMapState) => {
			return currentMap.data.isAutoImageProcessingActive;
		}),
		distinctUntilChanged()
	);

	imageManualProcessArgs$ = this.currentMap$.pipe(
		map((currentMap: ICaseMapState) => {
			return currentMap.data.imageManualProcessArgs;
		}),
		distinctUntilChanged(isEqual)
	);

	@AutoSubscription
	onAutoImageProcessingAndManualImageProcessActive$ = combineLatest(this.isAutoImageProcessingActive$, this.imageManualProcessArgs$).pipe(
		tap(([isAutoImageProcessingActive, imageManualProcessArgs]: [boolean, ImageManualProcessArgs]) => {
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
		})
	);

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	constructor(public store$: Store<any>, @Inject(toolsConfig) protected config: IToolsConfig) {
		super();
	}

	defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam: IImageProcParam) => {
			return <any> { ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
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
		this.onAutoImageProcessingAndManualImageProcessActive$.pipe(take(1)).subscribe();
	}

	setCustomMainLayer(layer) {
		if (!isEqual(this.getMainLayer(), layer)) {
			this.removeImageLayer();
		}
		this.customMainLayer = layer;
	}

	getMainLayer(): any {
		return Boolean(this.customMainLayer) ? this.customMainLayer : this.communicator.ActiveMap.getMainLayer();
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

	public isImageLayerAndImageProcessing(): boolean {
		return Boolean(this.imageLayer && this._imageProcessing);
	}

	createImageLayer([isAutoImageProcessingActive, imageManualProcessArgs]: [boolean, ImageManualProcessArgs]) {
		this.imageLayer = this.getExistingRasterLayer();
		if (this.imageLayer) {
			return;
		}
		const mainLayer = this.getMainLayer();
		const imageLayer = mainLayer.get('imageLayer');
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
			if (layer instanceof ImageLayer) {
				const source = layer.getSource();
				return source instanceof ProjectableRaster;
			}
			return false;
		});
		return imageLayer;
	}

}
