import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { CoreModule } from '@ansyn/core';

@NgModule({
	imports: [CommonModule, CoreModule],
	declarations: [SettingsComponent],
	entryComponents: [SettingsComponent]
})
export class SettingsModule {

}
