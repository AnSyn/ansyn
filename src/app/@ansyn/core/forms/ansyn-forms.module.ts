import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynCheckboxComponent } from './ansyn-checkbox/ansyn-checkbox.component';
import { AnsynInputComponent } from './ansyn-input/ansyn-input.component';
import { SliderCheckboxComponent } from './slider-checkbox/slider-checkbox.component';
import { FormsModule } from '@angular/forms';
import { AnsynButtonComponent } from './ansyn-button/ansyn-button.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule
	],
	declarations: [
		AnsynCheckboxComponent,
		AnsynInputComponent,
		SliderCheckboxComponent,
		AnsynButtonComponent
	],
	exports: [
		AnsynCheckboxComponent,
		AnsynInputComponent,
		SliderCheckboxComponent,
		AnsynButtonComponent
	]
})
export class AnsynFormsModule {
}
