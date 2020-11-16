import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynCheckboxComponent } from './ansyn-checkbox/ansyn-checkbox.component';
import { AnsynInputComponent } from './ansyn-input/ansyn-input.component';
import { SliderCheckboxComponent } from './slider-checkbox/slider-checkbox.component';
import { FormsModule } from '@angular/forms';
import { AnsynButtonComponent } from './ansyn-button/ansyn-button.component';
import { AnsynRadioComponent } from './ansyn-radio/ansyn-radio.component';
import { ComboBoxOptionComponent } from './combo-box-option/combo-box-option.component';
import { ComboBoxComponent } from './combo-box/combo-box.component';
import { ComboBoxTriggerComponent } from './combo-box-trigger/combo-box-trigger.component';
import { FileInputComponent } from './file-input/file-input.component';
import { MatInputModule } from '@angular/material/input';

@NgModule({
	imports: [
		CommonModule,
		MatInputModule,
		FormsModule
	],
	declarations: [
		AnsynCheckboxComponent,
		AnsynInputComponent,
		SliderCheckboxComponent,
		AnsynButtonComponent,
		AnsynRadioComponent,
		ComboBoxComponent,
		ComboBoxTriggerComponent,
		ComboBoxOptionComponent,
		FileInputComponent
	],
	exports: [
		AnsynCheckboxComponent,
		AnsynInputComponent,
		SliderCheckboxComponent,
		AnsynButtonComponent,
		AnsynRadioComponent,
		ComboBoxComponent,
		ComboBoxTriggerComponent,
		ComboBoxOptionComponent,
		FileInputComponent
	]
})
export class AnsynFormsModule {
}
