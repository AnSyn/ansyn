import { Store } from '@ngrx/store';
import { BaseImageryPlugin, ImageryPlugin, IMapErrorMessage, IMapProgress } from '@ansyn/imagery';
import { SetProgressBarAction, SetToastMessageAction } from '@ansyn/map-facade';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/imagery-ol';
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
