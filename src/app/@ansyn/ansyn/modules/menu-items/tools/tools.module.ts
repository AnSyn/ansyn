import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import { ToolsComponent } from './tools/tools.component';
import { GoToModule } from './go-to/go-to.module';
import { AnnotationsControlComponent } from './components/annotations-control/annotations-control.component';
import { StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from './reducers/tools.reducer';
import { MapFacadeModule, ProjectionConverterService } from '@ansyn/map-facade';
import { IToolsConfig, toolsConfig } from './models/tools-config';
import { AnnotationsContextMenuModule } from '@ansyn/ol';
import { MeasureControlComponent } from './components/measure-control/measure-control.component';
import { TranslateModule } from '@ngx-translate/core';
import { ExportMapsPopupComponent } from './export-maps-popup/export-maps-popup.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		MapFacadeModule.provide({
			entryComponents: {
				container: [MeasureControlComponent],
			status: [],
				floating_menu: []
			}
		}),
		GoToModule,
		StoreModule.forFeature(toolsFeatureKey, ToolsReducer),
		AnnotationsContextMenuModule,
		TranslateModule,
		CoreModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule
	],
	providers: [ProjectionConverterService],
	declarations: [ToolsComponent, AnnotationsControlComponent, MeasureControlComponent, ExportMapsPopupComponent],
	entryComponents: [ToolsComponent, MeasureControlComponent, ExportMapsPopupComponent],
	exports: [ToolsComponent, MatDialogModule]
})

export class ToolsModule {


	static forRoot(config: IToolsConfig): ModuleWithProviders<ToolsModule> {
		return {
			ngModule: ToolsModule,
			providers: [
				{ provide: toolsConfig, useValue: config }
			]
		};
	}

}
