import { IMapErrorMessage, IMapProgress, SetToastMessageAction } from '@ansyn/core';
import { Store } from '@ngrx/store';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { SetProgressBarAction } from '@ansyn/map-facade';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../../maps/openlayers-disabled-map/openlayers-disabled-map';
import { tap } from 'rxjs/operators';
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
				tap(({ progress }: IMapProgress) => {
					this.store$.dispatch(new SetProgressBarAction({ progress, mapId: this.mapId }));
				})
			).subscribe(),
			this.communicator.ActiveMap.tilesLoadErrorEventEmitter.pipe(
				tap(({ message }: IMapErrorMessage) => {
					this.store$.dispatch(new SetToastMessageAction({
						toastText: message,
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
