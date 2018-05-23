import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { Actions } from '@ngrx/effects';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/retry';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CaseOrientation } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { BackToWorldSuccess, BackToWorldView, CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { CaseMapExtentPolygon, CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { ExtentCalculator } from '@ansyn/core/utils/extent-calculator';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Actions, Store, ProjectionService]
})
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	isEnabled = true;

	calculateNorth$ = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.communicator.id)
		.withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
			return [payload.forceFirstDisplay, comboBoxesProperties.orientation, payload.overlay];
		})
		.switchMap(([forceFirstDisplay, orientation, overlay]: [boolean, CaseOrientation, Overlay]) => {
			return this.pointNorth()
				.do(virtualNorth => {
					this.communicator.setVirtualNorth(virtualNorth);
					if (!forceFirstDisplay) {
						switch (orientation) {
							case 'Align North':
								this.communicator.setRotation(virtualNorth);
								break;
							case 'Imagery Perspective':
								this.communicator.setRotation(overlay.azimuth);
								break;
						}
					}
				});
		});

	backToWorldSuccessSetNorth$ = this.actions$
		.ofType<BackToWorldSuccess>(CoreActionTypes.BACK_TO_WORLD_SUCCESS)
		.filter((action: BackToWorldSuccess) => action.payload.mapId === this.communicator.id)
		.withLatestFrom(this.store$.select(statusBarStateSelector))
		.do(([action, { comboBoxesProperties }]: [BackToWorldView, IStatusBarState]) => {
			this.communicator.setVirtualNorth(0);
			switch (comboBoxesProperties.orientation) {
				case 'Align North':
				case 'Imagery Perspective':
					this.communicator.setRotation(0);
			}
		});

	get mapObject() {
		return this.iMap.mapObject;
	}

	constructor(protected actions$: Actions,
				public store$: Store<any>,
				protected projectionService: ProjectionService) {
		super();
	}

	pointNorth(): Observable<number> {
		return this.communicator
			.getPosition()
			.map((position: CaseMapPosition): number => ExtentCalculator.calcRotation(position.extentPolygon) + this.mapObject.getView().getRotation())
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.calculateNorth$.subscribe(),
			this.backToWorldSuccessSetNorth$.subscribe()
		);
	}

}
