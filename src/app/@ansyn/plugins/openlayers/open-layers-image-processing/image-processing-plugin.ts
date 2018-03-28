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
import ImageLayer from 'ol/layer/image';
import { OpenLayersImageProcessing } from '@ansyn/plugins/openlayers/open-layers-map/image-processing/open-layers-image-processing';
import Raster from 'ol/source/raster';
import { Actions, Effect } from '@ngrx/effects';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { SetMapAutoImageProcessing } from '@ansyn/map-facade';


@Injectable()
export class ImageProcessingPlugin extends BaseImageryPlugin {
	static mapName = OpenlayersMapComponent.mapName;
	private _iconStyle: Style;
	private _existingLayer;
	private _imageProcessing: OpenLayersImageProcessing;
	private imageLayer: ImageLayer;

	onToggleImageProcessing$: Observable<any> = this.actions$
		.ofType<SetMapAutoImageProcessing>(MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING)
		.filter((action: SetMapAutoImageProcessing) => action.payload.mapId === this.mapId)
		.do((action: SetMapAutoImageProcessing) =>  {
			this.setAutoImageProcessing(action.payload.toggleValue)
		});

	/*	onSetManualImageProcessing$: Observable<any> = this.actions$
			.ofType(MapActionTypes.SET_MAP_MANUAL_IMAGE_PROCESSING)
			.map((action: SetMapManualImageProcessing) => [action, this.communicatorsService.provide(action.payload.mapId)])
			.filter(([action, communicator]: [SetMapManualImageProcessing, CommunicatorEntity]) => Boolean(communicator))
			.do(([action, communicator]: [SetMapManualImageProcessing, CommunicatorEntity]) => {
				const imageProccesingTool = communicator.getPlugin<ImageProcessingPlugin>(ImageProcessingPlugin);
				imageProccesingTool.setManualImageProcessing(action.payload.processingParams);
			});*/


	constructor(public actions$: Actions) {
		super();
	}

	public init(): void {
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

		if (!this.imageLayer  || !this._imageProcessing) {
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
		const layers = this.communicator.ActiveMap.mapObject.getLayers();
		let imageLayer: ImageLayer = layers.array_.find((layer) => layer instanceof ImageLayer);
		if (!imageLayer || !this._imageProcessing) {
			return;
		}
		this._imageProcessing.processImage(processingParams);
	}

	initEffects() {
		this.subscriptions.push(
			this.onToggleImageProcessing$.subscribe()
		)
	}
}
