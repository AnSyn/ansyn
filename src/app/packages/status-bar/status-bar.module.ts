import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core';
import { ComboBoxComponent } from './combo-box/combo-box.component';
import { TimelineTimepickerComponent } from './timeline-timepicker/timeline-timepicker.component';





@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		CoreModule

	],
	declarations: [StatusBarComponent, ComboBoxComponent,TimelineTimepickerComponent ],
	exports: [StatusBarComponent]
})
export class StatusBarModule { }
