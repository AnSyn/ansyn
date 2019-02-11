import { IMapErrorMessage, IMapProgress, SetToastMessageAction } from '@ansyn/core';
import { Store } from '@ngrx/store';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { SetProgressBarAction } from '@ansyn/map-facade';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../../maps/openlayers-disabled-map/openlayers-disabled-map';
import { filter, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store]
})
export class MonitorPlugin extends BaseImageryPlugin {
	subscriptions: Subscription[] = [];

	constructor(protected store$: Store<any>) {
		super();
	}

	onInit(): void {
		this.subscriptions.push(
			this.communicator.ActiveMap.tilesLoadProgressEventEmitter.pipe(
				filter((payload: IMapProgress) => payload.mapId === this.mapId),
				tap((payload: IMapProgress) => {
					this.store$.dispatch(new SetProgressBarAction(payload));
				})
			).subscribe(),
			this.communicator.ActiveMap.tilesLoadErrorEventEmitter.pipe(
				filter((payload: IMapErrorMessage) => payload.mapId === this.mapId),
				tap((payload: IMapErrorMessage) => {
					this.store$.dispatch(new SetToastMessageAction({
						toastText: payload.message,
						showWarningIcon: true
					}));
				})
			).subscribe());
	}

	onDispose(): void {
		this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
		super.onDispose();
	}

}
