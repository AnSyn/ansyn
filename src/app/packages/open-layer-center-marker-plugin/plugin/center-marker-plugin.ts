import { CommunicatorEntity, IMap, IMapPlugin } from '@ansyn/imagery';
import Vector from 'ol/source/vector';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Style from 'ol/style/style';
import Icon from 'ol/style/icon';
import VectorLayer from 'ol/layer/vector';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

export class CenterMarkerPlugin implements IMapPlugin {
	static sPluginType = 'openLayerCenterMarker';
	pluginType: string;
	private _subscriptions;
	private _imageryCommunicator: CommunicatorEntity;


	private _iconStyle: Style;
	private _existingLayer;

	private _isEnabled: boolean;

	public set isEnabled(value: boolean) {
		if (this._isEnabled !== value) {
			this._isEnabled = value;

			if (this.isEnabled) {
				this.tryDrawCenter();
			} else {
				this.tryDeleteCenter();
			}
		}
	}

	public get isEnabled(): boolean {
		return this._isEnabled;
	}

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService) {
		this.pluginType = CenterMarkerPlugin.sPluginType;

		this._isEnabled = false;

		this._iconStyle = new Style({
			image: new Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: [0.5, 46],
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				src: '/assets/icons/filters.svg'
			}))
		});

		this._subscriptions = [];
	}

	public init(mapId: string): void {
		this._imageryCommunicator = this.imageryCommunicatorService.provide(mapId);
		this.register();
	}

	private register() {
		this._subscriptions.push(this._imageryCommunicator.positionChanged.subscribe((position: CaseMapPosition) => {
			if (this.isEnabled) {
				this.tryDrawCenter();
			} else {
				this.tryDeleteCenter();
			}
		}));
	}

	private unregister() {
		for (let i = 0; i < this._subscriptions.length; i++) {
			this._subscriptions[i].unsubscribe();
		}
		this._subscriptions = [];
	}

	public dispose() {
		this.tryDeleteCenter();
		this.unregister();
	}

	private tryDeleteCenter() {
		if (this._existingLayer) {
			this._imageryCommunicator.removeLayer(this._existingLayer);
			this._existingLayer = null;
		}
	}

	private tryDrawCenter() {

		this.tryDeleteCenter();

		if (!this._isEnabled) {
			return;
		}

		const map: IMap = this._imageryCommunicator.ActiveMap;

		const center = map.mapObject.getView().getCenter();

		const iconFeature = new Feature({
			geometry: new Point(center),
			name: 'Center'
		});

		iconFeature.setStyle(this._iconStyle);

		const vectorSource = new Vector({
			features: [iconFeature]
		});

		this._existingLayer = new VectorLayer({ source: vectorSource });

		this._imageryCommunicator.addLayer(this._existingLayer);
	}
}
