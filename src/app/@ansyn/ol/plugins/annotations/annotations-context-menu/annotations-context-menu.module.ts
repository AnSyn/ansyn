import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotationContextMenuComponent } from './annotation-context-menu/annotation-context-menu.component';
import { MapFacadeModule } from '../../../../map-facade/map-facade.module';
import { FormsModule } from '@angular/forms';
import { AnnotationsWeightComponent } from './annotations-weight/annotations-weight.component';
import { AnnotationsColorComponent } from './annotations-color/annotations-color.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';

@NgModule({
	declarations: [AnnotationContextMenuComponent, AnnotationsWeightComponent, AnnotationsColorComponent, ColorPickerComponent],
	entryComponents: [AnnotationContextMenuComponent],
	exports: [AnnotationContextMenuComponent, AnnotationsWeightComponent, AnnotationsColorComponent, ColorPickerComponent],
	imports: [CommonModule, MapFacadeModule, FormsModule]
})
export class AnnotationsContextMenuModule {
}
