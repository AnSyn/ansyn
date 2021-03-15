import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynCheckboxComponent } from './ansyn-checkbox/ansyn-checkbox.component';
import { AnsynInputComponent } from './ansyn-input/ansyn-input.component';
import { SliderCheckboxComponent } from './slider-checkbox/slider-checkbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnsynButtonComponent } from './ansyn-button/ansyn-button.component';
import { AnsynRadioComponent } from './ansyn-radio/ansyn-radio.component';
import { ComboBoxOptionComponent } from './combo-box-option/combo-box-option.component';
import { ComboBoxComponent } from './combo-box/combo-box.component';
import { ComboBoxTriggerComponent } from './combo-box-trigger/combo-box-trigger.component';
import { FileInputComponent } from './file-input/file-input.component';
import { MatInputModule } from '@angular/material/input';
import { AnsynComboTableComponent } from './ansyn-combo-table/ansyn-combo-table.component';
import { AnsynComboTableOptionComponent } from './ansyn-combo-table-option/ansyn-combo-table-option.component';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { BoldPipe } from './auto-complete/bold.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
	imports: [
		CommonModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		TranslateModule,
		MatInputModule,
		MatAutocompleteModule
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
		FileInputComponent,
		AnsynComboTableComponent,
		AnsynComboTableOptionComponent,
		AutoCompleteComponent,
		BoldPipe
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
		FileInputComponent,
		AnsynComboTableComponent,
		AnsynComboTableOptionComponent,
		AutoCompleteComponent
	]
})
export class AnsynFormsModule {
}
