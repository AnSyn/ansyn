import Vector from 'ol/source/vector';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Style from 'ol/style/style';
import Icon from 'ol/style/icon';
import VectorLayer from 'ol/layer/vector';
import { ICaseMapPosition } from '@ansyn/core';
import { Observable } from 'rxjs';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { BaseImageryMap } from '@ansyn/imagery';
import { ImageryPlugin } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: []
})
export class CenterMarkerPlugin extends BaseImageryPlugin {
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

	@AutoSubscription
	positionChanged$ = () => this.communicator.positionChanged.subscribe((position: ICaseMapPosition) => {
		if (this.isEnabled) {
			this.tryDrawCenter();
		} else {
			this.tryDeleteCenter();
		}
	});

	constructor() {
		super();
		this._isEnabled = false;

		this._iconStyle = new Style({
			image: new Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: [0.5, 46],
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				src: 'assets/icons/filters.svg'
			}))
		});

	}

	onResetView(): Observable<boolean> {
		return Observable.of(true);
	}

	public dispose() {
		super.dispose();
		this.tryDeleteCenter();
	}

	private tryDeleteCenter() {
		if (this._existingLayer) {
			this.communicator.removeLayer(this._existingLayer);
			this._existingLayer = null;
		}
	}

	private tryDrawCenter() {

		this.tryDeleteCenter();

		if (!this._isEnabled) {
			return;
		}

		const map: BaseImageryMap = this.communicator.ActiveMap;

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

		this.communicator.addLayer(this._existingLayer);
	}
}
