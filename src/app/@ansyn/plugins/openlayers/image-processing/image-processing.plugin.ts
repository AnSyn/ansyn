import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import ImageLayer from 'ol/layer/image';
import { OpenLayersImageProcessing } from '@ansyn/plugins/openlayers/image-processing/image-processing';
import Raster from 'ol/source/raster';
import { Actions } from '@ngrx/effects';
import {
	MapActionTypes, SetMapAutoImageProcessing,
	SetMapManualImageProcessing
} from '@ansyn/map-facade/actions/map.actions';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { isEqual } from 'lodash';

@Injectable()
export class ImageProcessingPlugin extends BaseImageryPlugin {
	static supported = [OpenlayersMapName, DisabledOpenLayersMapName];
	communicator: CommunicatorEntity;
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;

	currentMap$ = this.store$.select(mapStateSelector)
		.map(( mapState: IMapState ) => MapFacadeService.mapById(mapState.mapsList, this.mapId))
		.filter(Boolean);

	onToggleImageProcessing$: Observable<any> = this.currentMap$
		.map((currentMap: CaseMapState) => currentMap.data.isAutoImageProcessingActive)
		.distinctUntilChanged()
		.filter(this.isImageLayerAndImageProcessing.bind(this))
		.do(this.setAutoImageProcessing.bind(this));

	imageManualProcessArgs$ = this.currentMap$
		.map((currentMap: CaseMapState) => currentMap.data.imageManualProcessArgs)
		.distinctUntilChanged(isEqual)
		.filter(this.isImageLayerAndImageProcessing.bind(this))
		.do(this.setManualImageProcessing.bind(this));

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

	public setManualImageProcessing(processingParams: Object): void {
		this._imageProcessing.processImage(processingParams);
	}


	public isImageLayerAndImageProcessing(): boolean {
		return Boolean(this.imageLayer && this._imageProcessing)
	}

	onInit() {
		this.subscriptions.push(
			this.onToggleImageProcessing$.subscribe(),
			this.imageManualProcessArgs$.subscribe()
		)
	}
}
