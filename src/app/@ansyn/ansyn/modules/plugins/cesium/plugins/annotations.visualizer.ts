import { Observable, of } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery';

import { CesiumMap, CesiumProjectionService, BaseEntitiesVisualizer, CesiumDrawAnnotationsVisualizer } from '@ansyn/imagery-cesium';
import { LoggerService } from '../../../core/services/logger.service';
import { AutoSubscription } from 'auto-subscriptions';
import { tap, take, filter } from 'rxjs/operators';
import { selectAnnotationMode } from '../../../menu-items/tools/reducers/tools.reducer';

@ImageryPlugin({
	supported: [CesiumMap],
	deps: [Actions, LoggerService, Store, CesiumProjectionService]
})
export class AnnotationsVisualizer extends BaseEntitiesVisualizer {
	private cesiumDrawer: CesiumDrawAnnotationsVisualizer;

	@AutoSubscription
	annoatationModeChange$ = this.store.select(selectAnnotationMode).pipe(
		filter(mode => !!mode),
		tap((annotationMode) => {
		this.cesiumDrawer.startDrawing(annotationMode as any);
	}));
	constructor(protected actions: Actions,
				public loggerService: LoggerService,
				public store: Store<any>) {
		super();
	}

	onInit() {
		this.cesiumDrawer = this.communicator.getPlugin(CesiumDrawAnnotationsVisualizer);
	}

	onResetView(): Observable<boolean> {
		return of(true);
	};
}
