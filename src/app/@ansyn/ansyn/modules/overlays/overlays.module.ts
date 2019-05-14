import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './components/timeline/timeline.component';
import { OverlayTimelineStatusComponent } from './components/overlay-timeline-status/overlay-timeline-status.component';
import { OverlaysContainerComponent } from './components/container/overlays-container.component';
import { OverlaysEffects } from './effects/overlays.effects';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { OverlayStatusModule } from "./overlay-status/overlay-status.module";
import { OverlayReducer, overlaysFeatureKey } from './reducers/overlays.reducer';
import { OverlayOverviewComponent } from './components/overlay-overview/overlay-overview.component';
import { BaseOverlaySourceFactoryProvider, createOverlaysSourceProviders, IOverlaysMetadata } from './models/overlays-source-providers';
import { OverlaysLoaderComponent } from './components/overlays-loader/overlays-loader.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { CoreModule } from '../core/core.module';

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		OverlayStatusModule,
		StoreModule.forFeature(overlaysFeatureKey, OverlayReducer),
		EffectsModule.forFeature([OverlaysEffects]),
		CoreModule,
		MapFacadeModule
	],
	declarations: [
		TimelineComponent,
		OverlaysContainerComponent,
		OverlayTimelineStatusComponent,
		OverlayOverviewComponent,
		OverlaysLoaderComponent
	],
	exports: [
		OverlaysContainerComponent,
		TimelineComponent,
		OverlayOverviewComponent
	],
	providers: [
		createOverlaysSourceProviders([]),
		BaseOverlaySourceFactoryProvider
	]

})
export class OverlaysModule {
	static provide(metadata: IOverlaysMetadata): ModuleWithProviders {
		return {
			ngModule: OverlaysModule,
			providers: [
				createOverlaysSourceProviders(metadata.overlaySourceProviders)
			]
		};
	}
}


