import Graticule from 'ol/Graticule';
import Stroke from 'ol/style/Stroke';
import {
	BaseImageryPlugin, ImageryPlugin
} from '@ansyn/imagery';
import { Observable } from 'rxjs';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: []
})
export class GridLinesVisualizer extends BaseImageryPlugin {

	gridColor = 'rgba(245,245,245,0.85)';
	gridLineWidth = 3;
	gridShowLabels = true;
	protected graticule1: any;
	protected graticule2: any;
	protected _isEnabled: boolean;

	constructor() {
		super();
	}

	// override this method to format the angle
	formatAngle(angle: number) {
		// @ts-ignore
		const degrees = Math.trunc(angle);
		// @ts-ignore
		const minutesAndSeconds = (angle - degrees) * 60;
		let minutes = Math.round(minutesAndSeconds);
		let seconds = Math.round(minutesAndSeconds - minutes) * 3600;
		if (seconds >= 3600) {
			minutes += 1;
			seconds = 0;
		}
		return `${degrees + String.fromCharCode(176)} ${minutes.toFixed(0)} ${seconds.toFixed(0)}`;
	}

	onInit() {
		if (this.isEnabled) {
			this.showGridLines();
		}
	}

	set isEnabled(isEnabled: boolean) {
		this._isEnabled = isEnabled;
		if (isEnabled) {
			this.showGridLines();
		} else {
			this.destroyGridLines();
		}
	}

	get isEnabled(): boolean {
		return this._isEnabled;
	}

	showGridLines() {
		if (this.graticule1 || this.graticule2) {
			this.destroyGridLines();
		}

		this.graticule1 = new Graticule({
			// the style to use for the lines, optional.
			// latLabelFormatter: this.formatAngle.bind(this),
			// lonLabelFormatter: this.formatAngle.bind(this),
			intervals: [90, 45, 30, 20, 10, 5, 2, 1],
			strokeStyle: new Stroke({
				color: this.gridColor,
				width: this.gridLineWidth
			}),
			// lonLabelStyle: lonLabelStyle,
			showLabels: this.gridShowLabels
		});

		this.graticule2 = new Graticule({
			// the style to use for the lines, optional.
			intervals: [1 / 6],
			strokeStyle: new Stroke({
				color: 'rgba(245,245,245,0.45)',
				lineDash: [0.5, 4],
				width: 2
			}),
			latLabelFormatter: this.formatAngle.bind(this),
			lonLabelFormatter: this.formatAngle.bind(this),
			showLabels: false
		});

		this.graticule2.setMap(this.iMap.mapObject);
		this.graticule1.setMap(this.iMap.mapObject);
	}

	destroyGridLines() {
		if (this.graticule1) {
			this.graticule1.setMap(undefined);
			this.graticule1 = undefined;
		}

		if (this.graticule2) {
			this.graticule2.setMap(undefined);
			this.graticule2 = undefined;
		}
	}

	onResetView(): Observable<boolean> {
		return super.onResetView();
	}

	onDispose(): void {
		this.destroyGridLines();
		super.onDispose();
	}
}
