import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotationContextMenuComponent } from './components/annotation-context-menu/annotation-context-menu.component';
import { FormsModule } from '@angular/forms';
import { AnnotationsWeightComponent } from './components/annotations-weight/annotations-weight.component';
import { AnnotationsColorComponent } from './components/annotations-color/annotations-color.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatInputModule, MatSelectModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { AnnotationLabelComponent } from './components/annotation-label/annotation-label.component';
import { AnnotationsContextMenuButtonsComponent } from './components/annotations-context-menu-buttons/annotations-context-menu-buttons.component';

@NgModule({
	declarations: [
		AnnotationContextMenuComponent,
		AnnotationsWeightComponent,
		AnnotationsColorComponent,
		ColorPickerComponent,
		AnnotationLabelComponent,
		AnnotationsContextMenuButtonsComponent
	],
	entryComponents: [AnnotationContextMenuComponent],
	exports: [
		AnnotationContextMenuComponent,
		AnnotationsWeightComponent,
		AnnotationsColorComponent,
		ColorPickerComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ColorPickerModule,
		MatInputModule,
		MatSelectModule,
		TranslateModule
	]
})
export class AnnotationsContextMenuModule {
}
