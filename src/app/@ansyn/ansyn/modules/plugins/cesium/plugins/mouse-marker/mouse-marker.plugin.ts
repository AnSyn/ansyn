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

	isEnabled: boolean;

	constructor() {
		super();
		this.isEnabled = false;
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
		if (!this.isEnabled) {
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
