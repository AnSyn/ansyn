import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { CoreModule } from '@ansyn/core';
import { StoreModule } from '@ngrx/store';
import { settingsFeatureKey, SettingsReducer } from './reducers/settings.reducer';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		StoreModule.forFeature(settingsFeatureKey, SettingsReducer)
	],
	declarations: [SettingsComponent],
	entryComponents: [SettingsComponent]
})
export class SettingsModule {

}
