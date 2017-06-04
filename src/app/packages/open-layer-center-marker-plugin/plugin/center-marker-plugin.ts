/**
 * Created by AsafMas on 04/06/2017.
 */

import { IImageryCommunicator, IMap, IMapPlugin } from '@ansyn/imagery';
import { Position } from '@ansyn/core';
import * as ol from 'openlayers';

export class CenterMarkerPlugin implements IMapPlugin {
	pluginName: string;
	private _subscriptions;
	private _imageryCommunicator: IImageryCommunicator;

	private _iconStyle: ol.style.Style;
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

	constructor(mapStateName: string) {
		this.pluginName = mapStateName;
		this._isEnabled = true;

		this._iconStyle = new ol.style.Style({
			image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: [0.5, 46],
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				src: '/assets/icons/filters.png'
			}))
		});

		this._subscriptions = [];
	}

	public setImageryCommunicator(imageryCommunicator: IImageryCommunicator): void {
		this._imageryCommunicator = imageryCommunicator;

		this.register();
	}

	private register() {
		this._subscriptions.push(this._imageryCommunicator.positionChanged.subscribe((position: Position)=>{
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

		const map: IMap = this._imageryCommunicator.getActiveMapObject();

		const center = map.mapObject.getView().getCenter();

		const iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(center),
			name: 'Center'
		});

		iconFeature.setStyle(this._iconStyle);

		const vectorSource = new ol.source.Vector({
			features: [iconFeature]
		});

		const vectorLayer = new ol.layer.Vector({
			source: vectorSource,
		});
		this._existingLayer = vectorLayer;

		this._imageryCommunicator.addLayer(this._existingLayer);
	}
}
