import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadsComponent } from './components/uploads/uploads.component';
import { CoreModule } from '@ansyn/core';
import { FormsModule } from '@angular/forms';
import { EditSensorNameComponent } from './components/edit-sensor-name/edit-sensor-name.component';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		FormsModule
	],
	entryComponents: [UploadsComponent],
	declarations: [UploadsComponent, EditSensorNameComponent]
})
export class UploadsModule {
}
