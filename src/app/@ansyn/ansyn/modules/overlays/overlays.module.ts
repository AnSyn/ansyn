import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MapFacadeModule } from '@ansyn/map-facade';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CoreModule } from '../core/core.module';
import { OverlaysContainerComponent } from './components/container/overlays-container.component';
import { OverlayOverviewComponent } from './components/overlay-overview/overlay-overview.component';
import { OverlaySourceTypeNoticeComponent } from './components/overlay-source-type-notice/overlay-source-type-notice.component';
import { OverlayTimelineStatusComponent } from './components/overlay-timeline-status/overlay-timeline-status.component';
import { OverlaysLoaderComponent } from './components/overlays-loader/overlays-loader.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { OverlaysEffects } from './effects/overlays.effects';
import {
	BaseOverlaySourceFactoryProvider,
	createOverlaysSourceProviders,
	IOverlaysMetadata
} from './models/overlays-source-providers';
import { OverlayStatusModule } from './overlay-status/overlay-status.module';
import { OverlayReducer, overlaysFeatureKey } from './reducers/overlays.reducer';

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		OverlayStatusModule,
		StoreModule.forFeature(overlaysFeatureKey, OverlayReducer),
		EffectsModule.forFeature([OverlaysEffects]),
		CoreModule,
		MapFacadeModule.provide({
			entryComponents: {
				container: [OverlaySourceTypeNoticeComponent],
				status: [],
				floating_menu: []
			}
		})
	],
	declarations: [
		TimelineComponent,
		OverlaysContainerComponent,
		OverlayTimelineStatusComponent,
		OverlayOverviewComponent,
		OverlaysLoaderComponent,
		OverlaySourceTypeNoticeComponent
	],
	entryComponents: [OverlaySourceTypeNoticeComponent],
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


