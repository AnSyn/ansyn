import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlaysModule } from '../../@ansyn/ansyn/modules/overlays/overlays.module';
import { AnsynFormsModule } from '../../@ansyn/ansyn/modules/core/forms/ansyn-forms.module';
import { EffectsModule } from '@ngrx/effects';
import { ImageryModule } from "../../@ansyn/imagery/imagery.module";
import { OpenLayersSentinelSourceProvider } from "./open-layers-sentinel-source-provider";
import { SentinelSourceProvider } from "./sentinel-source-provider";
import { SentinelComboBoxComponent } from "./sentinel-combo-box/sentinel-combo-box.component";
import { FormsModule } from '@angular/forms';
import { SentinelEffects } from "./effects/sentinel.effects";
import { sentinelFeatureKey, SentinelReducer } from "./reducers/sentinel.reducer";
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
	declarations: [
		SentinelComboBoxComponent
	],
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
	exports: [
		SentinelComboBoxComponent
	]
})
export class SentinelModule {
}
