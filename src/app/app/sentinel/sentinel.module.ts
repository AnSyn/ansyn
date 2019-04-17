import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { OpenLayersSentinelSourceProvider } from './open-layers-sentinel-source-provider';
import { SentinelSourceProvider } from './sentinel-source-provider';
import { FormsModule } from '@angular/forms';
import { SentinelEffects } from './effects/sentinel.effects';
import { sentinelFeatureKey, SentinelReducer } from './reducers/sentinel.reducer';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { AnsynFormsModule, OverlaysModule } from '@ansyn/ansyn';
import { ImageryModule } from '@ansyn/imagery';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		FormsModule,
		AnsynFormsModule,
		HttpClientModule,
		StoreModule.forFeature(sentinelFeatureKey, SentinelReducer),
		EffectsModule.forFeature([SentinelEffects]),
		ImageryModule.provide({
			maps: [],
			mapSourceProviders: [OpenLayersSentinelSourceProvider],
			plugins: []
		}),
		OverlaysModule.provide({
			overlaySourceProviders: [
				SentinelSourceProvider
			]
		})
	],
	exports: []
})
export class SentinelModule {
}
