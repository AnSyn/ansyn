/**
 * Created by AsafMas on 04/06/2017.
 */

import { CommunicatorEntity, IMap, IMapPlugin } from '@ansyn/imagery';
import Vector from 'ol/source/vector';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Style from 'ol/style/style';
import Icon from 'ol/style/icon';
import VectorLayer from 'ol/layer/vector';
import { MapPosition } from '../../imagery/model/map-position';

export class CenterMarkerPlugin implements IMapPlugin {
	static s_pluginType = 'openLayerCenterMarker';
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

	constructor() {
		this.pluginType = CenterMarkerPlugin.s_pluginType;

		this._isEnabled = false;

		this._iconStyle = new Style({
			image: new Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: [0.5, 46],
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				src: '/assets/icons/filters.png'
			}))
		});

		this._subscriptions = [];
	}

	public init(imageryCommunicator: CommunicatorEntity): void {
		this._imageryCommunicator = imageryCommunicator;
		this.register();
	}

	private register() {
		this._subscriptions.push(this._imageryCommunicator.positionChanged.subscribe((position: MapPosition) => {
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

		this._existingLayer = new VectorLayer({source: vectorSource});

		this._imageryCommunicator.addLayer(this._existingLayer);
	}
}
