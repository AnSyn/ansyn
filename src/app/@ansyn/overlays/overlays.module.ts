import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './components/timeline/timeline.component';
import { OverlayStatusComponent } from './components/overlay-status/overlay-status.component';
import { OverlaysContainerComponent } from './components/container/overlays-container.component';
import { OverlaysService } from './services/overlays.service';
import { OverlaysEffects } from './effects/overlays.effects';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { OverlayReducer, overlaysFeatureKey } from './reducers/overlays.reducer';
import { OverlayOverviewComponent } from '@ansyn/overlays/components/overlay-overview/overlay-overview.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '@ansyn/core/core.module';

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		StoreModule.forFeature(overlaysFeatureKey, OverlayReducer),
		EffectsModule.forFeature([OverlaysEffects]),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		})
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
		OverlaysService
	]

})
export class OverlaysModule {
}


