import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadsComponent } from './components/uploads/uploads.component';
import { CoreModule } from '@ansyn/core';
import { FormsModule } from '@angular/forms';
import { EditSensorNameComponent } from './components/edit-sensor-name/edit-sensor-name.component';
import { MenuModule } from '@ansyn/menu';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		FormsModule,
		MenuModule.provideMenuItems([

		])
	],
	entryComponents: [UploadsComponent],
	declarations: [UploadsComponent, EditSensorNameComponent]
})
export class UploadsModule {
}
