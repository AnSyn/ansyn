import { Observable } from 'rxjs/Observable';
import ImageLayer from 'ol/layer/image';
import { OpenLayersImageProcessing } from '@ansyn/plugins/openlayers/image-processing/image-processing';
import Raster from 'ol/source/raster';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { Store } from '@ngrx/store';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store]
})
export class ImageProcessingPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;
	currentMap$ = this.store$.select(mapStateSelector)
		.map((mapState: IMapState) => MapFacadeService.mapById(mapState.mapsList, this.mapId))
		.filter(Boolean);

	onToggleImageProcessing$: Observable<any> = this.currentMap$
		.map((currentMap: CaseMapState) => currentMap.data.isAutoImageProcessingActive)
		.distinctUntilChanged()
		.filter(this.isImageLayerAndImageProcessing.bind(this))
		.do(this.setAutoImageProcessing.bind(this));

	imageManualProcessArgs$ = this.currentMap$
		.filter((currentMap: CaseMapState) => !currentMap.data.isAutoImageProcessingActive)
		.map((currentMap: CaseMapState) => currentMap.data.imageManualProcessArgs)
		.filter(this.isImageLayerAndImageProcessing.bind(this))
		.do((imageManualProcessArgs) => {
			this._imageProcessing.processImage(imageManualProcessArgs);
		});

	constructor(public store$: Store<any>) {
		super();
	}

	onResetView(): Observable<boolean> {
		this._imageProcessing = new OpenLayersImageProcessing();
		const layers = this.communicator.ActiveMap.mapObject.getLayers();
		this.imageLayer = layers.getArray().find((layer) => layer instanceof ImageLayer);
		if (this.imageLayer && this.imageLayer.getSource() instanceof Raster) {
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

	public isImageLayerAndImageProcessing(): boolean {
		return Boolean(this.imageLayer && this._imageProcessing);
	}

	onInit() {
		this.subscriptions.push(
			this.onToggleImageProcessing$.subscribe(),
			this.imageManualProcessArgs$.subscribe()
		);
	}
}
