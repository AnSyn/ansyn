import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadsComponent } from './components/uploads/uploads.component';
import { CoreModule } from '@ansyn/core';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material';
import { EditSensorNameComponent } from './components/edit-sensor-name/edit-sensor-name.component';
import { StoreModule } from '@ngrx/store';
import { uploadsFeatureKey, UploadsReducer } from './reducers/uploads.reducer';
import { MenuModule } from '@ansyn/menu';
import { UploadListComponent } from './components/upload-list/upload-list.component';
import { EffectsModule } from '@ngrx/effects';
import { UploadFilesEffects } from './effects/upload-files.effects';
import { UploadFileService } from './services/upload-file.service';
import { UploadItemComponent } from './components/upload-item/upload-item.component';
import { GeotiffDatetimePickerComponent } from './components/geotiff-datetime-picker/geotiff-datetime-picker.component';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		FormsModule,
		MatProgressBarModule,
		MenuModule.provideMenuItems([{
			name: 'Uploads',
			component: UploadsComponent,
			iconClass: 'icon-layer-export'
		}]),
		EffectsModule.forFeature([UploadFilesEffects]),
		StoreModule.forFeature(uploadsFeatureKey, UploadsReducer)
	],
	providers: [
		UploadFileService
	],
	entryComponents: [UploadsComponent],
	declarations: [UploadsComponent, EditSensorNameComponent, UploadListComponent, UploadItemComponent, GeotiffDatetimePickerComponent]
})
export class UploadsModule {
}
