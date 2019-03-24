import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './components/timeline/timeline.component';
import { OverlayStatusComponent } from './components/overlay-status/overlay-status.component';
import { OverlaysContainerComponent } from './components/container/overlays-container.component';
import { OverlaysEffects } from './effects/overlays.effects';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { OverlayReducer, overlaysFeatureKey } from './reducers/overlays.reducer';
import { OverlayOverviewComponent } from './components/overlay-overview/overlay-overview.component';
import { CoreModule } from '../core/public_api';
import { BaseOverlaySourceFactoryProvider, createOverlaysSourceProviders, IOverlaysMetadata } from './models/overlays-source-providers';
import { OverlaysLoaderComponent } from './components/overlays-loader/overlays-loader.component';

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		StoreModule.forFeature(overlaysFeatureKey, OverlayReducer),
		EffectsModule.forFeature([OverlaysEffects]),
		CoreModule
	],
	declarations: [
		TimelineComponent,
		OverlaysContainerComponent,
		OverlayStatusComponent,
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


