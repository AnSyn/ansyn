import { ImageryPlugin, IMousePointerMove, IVisualizerEntity } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import { AutoSubscription } from 'auto-subscriptions';
import { BaseEntitiesVisualizer, CesiumMap } from '@ansyn/imagery-cesium';
import { point } from '@turf/turf';

@ImageryPlugin({
	supported: [CesiumMap],
	deps: []
})
export class MouseMarkerPlugin extends BaseEntitiesVisualizer {

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

	private _isEnabled: boolean;

	constructor() {
		super();
		this._isEnabled = false;
	}

	@AutoSubscription
	mousePositionChanged$ = () => this.communicator.ActiveMap.mousePointerMoved.subscribe((position: IMousePointerMove) => {
		if (this.isEnabled) {
			this.tryDraw(position);
		}
	});

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
