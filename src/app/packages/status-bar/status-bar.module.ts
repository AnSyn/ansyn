import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core';
import { ComboBoxComponent } from './components/combo-box/combo-box.component';
import { TimelineTimepickerComponent } from './components/timeline-timepicker/timeline-timepicker.component';


@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		CoreModule

	],
	declarations: [StatusBarComponent, ComboBoxComponent, TimelineTimepickerComponent],
	exports: [StatusBarComponent]
})
export class StatusBarModule {
}
