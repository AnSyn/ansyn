import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import { ToolsComponent } from './tools/tools.component';
import { GoToModule } from './go-to/go-to.module';
import { OverlaysDisplayModeComponent } from './overlays-display-mode/overlays-display-mode.component';
import { AnnotationsControlComponent } from './components/annotations-control/annotations-control.component';
import { StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from './reducers/tools.reducer';
import { ImageProcessingControlComponent } from './components/image-processing-control/image-processing-control.component';
import { ProjectionConverterService } from './services/projection-converter.service';
import { IToolsConfig, toolsConfig } from './models/tools-config';
import { MapFacadeModule } from '@ansyn/map-facade';
import { AnnotationsContextMenuModule } from '@ansyn/ol';
import { MeasureControlComponent } from './components/measure-control/measure-control.component';
import { TranslateModule } from '@ngx-translate/core';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		MapFacadeModule.provide({
			entryComponents: {
				container: [MeasureControlComponent],
				status: [],
			}
		}),
		GoToModule,
		StoreModule.forFeature(toolsFeatureKey, ToolsReducer),
		AnnotationsContextMenuModule,
		TranslateModule,
		CoreModule
	],
	providers: [ProjectionConverterService],
	declarations: [ToolsComponent, ImageProcessingControlComponent, OverlaysDisplayModeComponent, AnnotationsControlComponent, MeasureControlComponent],
	entryComponents: [ToolsComponent, MeasureControlComponent],
	exports: [ToolsComponent]
})

export class ToolsModule {


	static forRoot(config: IToolsConfig): ModuleWithProviders {
		return {
			ngModule: ToolsModule,
			providers: [
				{provide: toolsConfig, useValue: config}
			]
		};
	}

}
