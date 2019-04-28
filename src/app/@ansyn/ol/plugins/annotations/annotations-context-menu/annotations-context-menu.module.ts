import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotationContextMenuComponent } from './components/annotation-context-menu/annotation-context-menu.component';
import { FormsModule } from '@angular/forms';
import { AnnotationsWeightComponent } from './components/annotations-weight/annotations-weight.component';
import { AnnotationsColorComponent } from './components/annotations-color/annotations-color.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
	declarations: [
		AnnotationContextMenuComponent,
		AnnotationsWeightComponent,
		AnnotationsColorComponent,
		ColorPickerComponent,
		ClickOutsideDirective
	],
	entryComponents: [AnnotationContextMenuComponent],
	exports: [
		AnnotationContextMenuComponent,
		AnnotationsWeightComponent,
		AnnotationsColorComponent,
		ColorPickerComponent,
		ClickOutsideDirective
	],
	imports: [CommonModule, FormsModule, ColorPickerModule]
})
export class AnnotationsContextMenuModule {
}
