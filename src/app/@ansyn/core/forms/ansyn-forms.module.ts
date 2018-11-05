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

@NgModule({
	imports: [
		CommonModule,
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
		ComboBoxOptionComponent
	],
	exports: [
		AnsynCheckboxComponent,
		AnsynInputComponent,
		SliderCheckboxComponent,
		AnsynButtonComponent,
		AnsynRadioComponent,
		ComboBoxComponent,
		ComboBoxTriggerComponent,
		ComboBoxOptionComponent
	]
})
export class AnsynFormsModule {
}
