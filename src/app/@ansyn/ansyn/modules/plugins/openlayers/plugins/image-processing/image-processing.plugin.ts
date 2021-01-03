import { Observable, of, combineLatest } from 'rxjs';
import ImageLayer from 'ol/layer/Image';
import RasterSource from 'ol/source/Raster';
import { BaseImageryPlugin, ImageryLayerProperties, ImageryPlugin } from '@ansyn/imagery';
import { Store, select } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import {
	OpenLayersDisabledMap,
	OpenLayersMap
} from '@ansyn/ol';
import { OpenLayersImageProcessing } from './image-processing';
import { distinctUntilChanged, filter, map, take, tap, concatMap, withLatestFrom } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { IImageManualProcessArgs, IOverlayImageProcess } from '../../../../menu-items/cases/models/case.model';
import {
	selectOverlaysImageProcess
} from '../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { OverlayStatusService } from '../../../../overlays/overlay-status/services/overlay-status.service';
import { selectMaps, selectOverlayByMapId } from '@ansyn/map-facade';
import { IOverlay } from '../../../../overlays/models/overlay.model';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store, OverlayStatusService]
})

export class ImageProcessingPlugin extends BaseImageryPlugin {
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;
	selectOverlay$: Observable<IOverlay> =  this.store$.pipe(select(selectMaps)).pipe(
		map( maps => maps[this.mapId]),
		map( map => map?.data?.overlay)
	);


	isImageProcessActive$ = combineLatest([this.selectOverlay$, this.store$.pipe(select(selectOverlaysImageProcess))]).pipe(
		map(([overlay, overlaysImageProcess]: [IOverlay, any]) => overlaysImageProcess && overlaysImageProcess[overlay?.id]),
		filter(Boolean),
		distinctUntilChanged(isEqual),
		map( (overlayImageProcess: IOverlayImageProcess) => {
			return [overlayImageProcess.isAuto, overlayImageProcess.manuelArgs]
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
					this._imageProcessing.processImage(imageManualProcessArgs);
				}
			}
		})
	);

	constructor(public store$: Store<any>, protected overlayStatusService: OverlayStatusService) {
		super();
	}

	isImageProcessActive(isAutoImageProcessingActive: boolean, imageManualProcessArgs: IImageManualProcessArgs) {
		const result = isAutoImageProcessingActive || (!!imageManualProcessArgs && !this.overlayStatusService.isDefaultImageProcess(imageManualProcessArgs));
		return result;
	}

	onResetView(): Observable<boolean> {
		return of(true).pipe(
			tap(() => this.recalculateManualImageProcessActive())
		);
	}

	recalculateManualImageProcessActive() {
		this._imageProcessing = new OpenLayersImageProcessing();
		this.onAutoImageProcessingAndManualImageProcessActive$.pipe(take(1)).subscribe();
	}

	getMainLayer(): any {
		const overlay = this.communicator.ActiveMap.getLayers().find(layer => layer.get(ImageryLayerProperties.IS_OVERLAY))
		if (overlay) {
			return overlay;
		}
		return ;
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
		const mainLayer = this.getMainLayer();
		if (this.imageLayer || !mainLayer) {
			return;
		}
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
