import { CommunicatorEntity, IMapPlugin } from '@ansyn/imagery';
import { Overlay } from '@ansyn/core/models/overlay.model';
import proj from 'ol/proj';
import { EventEmitter } from '@angular/core';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

export interface INorthData {
	imagePhotoAngle: number;
	imageNorthAngle: number;
	imageId: string
}

export class ImageNorthPlugin implements IMapPlugin {
	static sPluginType = 'openLayerImageNorth';
	pluginType: string;
	private _subscriptions;
	private _imageryCommunicator: CommunicatorEntity;
	overlay: Overlay = null;
	isEnabled = true;
	public imageNorthChanged: EventEmitter<number>;

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService) {
		this.pluginType = ImageNorthPlugin.sPluginType;
		this._subscriptions = [];
	}

	public init(mapId: string): void {
		this._imageryCommunicator = this.imageryCommunicatorService.provide(mapId);
		this.register();
	}

	private register() {
		this._subscriptions.push(this._imageryCommunicator.ActiveMap.mapObject.on('moveend', () => {
			this.updateNorth(this._imageryCommunicator.ActiveMap.mapObject);
		}));
	}

	private unregister() {
		for (let i = 0; i < this._subscriptions.length; i++) {
			this._subscriptions[i].unsubscribe();
		}
		this._subscriptions = [];
	}

	public dispose() {
		this.unregister();
	}

	setOverlay(overlay: Overlay) {
		this.overlay = overlay;
	}

	updateNorth(mapObject) {
		const size = mapObject.getSize();
		const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
		const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);

		this.projectPoints(mapObject, [olCenterView, olCenterViewWithOffset]).then((projectedPoints: any[]) => {
			const projectedCenterView = projectedPoints[0];
			const projectedCenterViewWithOffset = projectedPoints[1];
			const photoAngleRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
			const photoAngleDegree = photoAngleRad * 180 / Math.PI;
			console.log(`'northAngle: ${photoAngleDegree}'`);
		});
	}

	// override this method
	public projectPoints(mapObject: any, points: any[]): Promise<any[]> {
		const view = mapObject.getView();
		const projection = view.getProjection();
		const result = [];
		points.forEach((point) => {
			const projectedPoint = proj.transform(point, projection, 'EPSG:4326');
			result.push(projectedPoint);
		});
		return Promise.resolve(result);
	}
}
