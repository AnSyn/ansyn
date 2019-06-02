import { IMousePointerMove, IVisualizerEntity } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import { ImageryPlugin } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { CesiumMap } from '@ansyn/imagery-cesium';
import { BaseEntitiesVisualizer } from '@ansyn/imagery-cesium';
import { point } from '@turf/turf';

@ImageryPlugin({
	supported: [CesiumMap],
	deps: []
})
export class MouseMarkerPlugin extends BaseEntitiesVisualizer {

	private _isEnabled: boolean;

	public set isEnabled(value: boolean) {
		if (this._isEnabled !== value) {
			this._isEnabled = value;

			if (!this.isEnabled) {
				this.removeEntity('visEntity');
			}
		}
	}

	public get isEnabled(): boolean {
		return this._isEnabled;
	}

	@AutoSubscription
	mousePositionChanged$ = () => this.communicator.ActiveMap.mousePointerMoved.subscribe((position: IMousePointerMove) => {
		if (this.isEnabled) {
			this.tryDraw(position);
		}
	});

	constructor() {
		super();
		this._isEnabled = false;
	}

	onResetView(): Observable<boolean> {
		return of(true);
	}

	public dispose() {
		super.dispose();
	}

	private tryDraw(position: IMousePointerMove) {
		if (!this._isEnabled) {
			return;
		}

		const entity: IVisualizerEntity = {
			id: 'visEntity',
			icon: 'assets//logo.svg',
			featureJson: point([position.long, position.lat, position.height])
		};

		this.setEntities([entity]);
	}
}
