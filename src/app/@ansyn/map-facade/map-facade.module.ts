import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageryModule } from '@ansyn/imagery';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AlertsModule } from './alerts/alerts.module';
import { AnimatedEllipsisComponent } from './components/animated-ellipsis/animated-ellipsis.component';
import { AnsynLoaderComponent } from './components/ansyn-loader/ansyn-loader.component';
import { AnsynPopoverComponent } from './components/ansyn-popover/ansyn-popover.component';
import { ImageriesManagerComponent } from './components/imageries-manager/imageries-manager.component';
import { ImageryContainerComponent } from './components/imagery-container/imagery-container.component';
import { ImageryLoaderComponent } from './components/imagery-loader/imagery-loader.component';
import { ImageryRotationComponent } from './components/imagery-rotation/imagery-rotation.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { ImageryTileProgressComponent } from './components/imagery-tile-progress/imagery-tile-progress.component';
import { MapSearchBoxComponent } from './components/map-search-box/map-search-box.component';
import { ToastComponent } from './components/toast/toast.component';
import { WelcomeNotificationComponent } from './components/welcome-notification/welcome-notification.component';
import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';
import { MapEffects } from './effects/map.effects';
import {
	EntryComponentsProvider,
	IEntryComponentsEntities,
	provideEntryComponentsEntities
} from './models/entry-components-provider';
import { imageryStatusFeatureKey, ImageryStatusReducer } from './reducers/imagery-status.reducer';
import { mapFeatureKey, MapReducer } from './reducers/map.reducer';
import { GeocoderService } from './services/geocoder.service';

@NgModule({
	imports: [
		StoreModule.forFeature(mapFeatureKey, MapReducer),
		StoreModule.forFeature(imageryStatusFeatureKey, ImageryStatusReducer),
		EffectsModule.forFeature([MapEffects]),
		ImageryModule,
		CommonModule,
		FormsModule,
		AlertsModule
	],
	providers: [
		GeocoderService,
		provideEntryComponentsEntities({
			container: [],
			status: []
		}),
		EntryComponentsProvider
	],
	declarations: [
		ImageriesManagerComponent,
		ImageryRotationComponent,
		ImageryContainerComponent,
		ImageryLoaderComponent,
		ImageryTileProgressComponent,
		MapSearchBoxComponent,
		ImageryStatusComponent,
		WelcomeNotificationComponent,
		ToastComponent,
		InfiniteScrollDirective,
		AnimatedEllipsisComponent,
		AnsynLoaderComponent,
		AnsynPopoverComponent
	],
	exports: [
		ImageriesManagerComponent,
		ImageryStatusComponent,
		WelcomeNotificationComponent,
		ToastComponent,
		InfiniteScrollDirective,
		AnimatedEllipsisComponent,
		AnsynLoaderComponent,
		AnsynPopoverComponent
	]
})

export class MapFacadeModule {

	static provide(metadata: { entryComponents: IEntryComponentsEntities }): ModuleWithProviders {
		return {
			ngModule: MapFacadeModule,
			providers: [
				provideEntryComponentsEntities(metadata.entryComponents)
			]
		};
	}

	constructor() {
	}
}
