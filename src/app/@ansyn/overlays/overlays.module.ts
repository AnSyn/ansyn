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
import { CoreModule } from '@ansyn/core';
import { BaseOverlaySourceFactoryProvider, createOverlaysSourceProviders, IOverlaysMetadata } from './models/providers';

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
		OverlayOverviewComponent
	],
	exports: [
		OverlaysContainerComponent,
		TimelineComponent,
		OverlayOverviewComponent
	],
	providers: [
		BaseOverlaySourceFactoryProvider,
		createOverlaysSourceProviders([])
	]

})
export class OverlaysModule {
	static provide({ overlaySourceProviders }: IOverlaysMetadata): ModuleWithProviders {
		return {
			ngModule: OverlaysModule,
			providers: [
				createOverlaysSourceProviders(overlaySourceProviders)
			]
		};
	}
}


