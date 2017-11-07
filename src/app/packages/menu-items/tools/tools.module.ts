import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools/tools.component';
import { CoreModule } from '@ansyn/core';
import { GoToModule } from './go-to/go-to.module';
import { IToolsConfig, toolsConfig } from './models';
import { OverlaysDisplayModeComponent } from './overlays-display-mode/overlays-display-mode.component';
import { AnnotationsControlComponent } from './components/annotations-control/annotations-control.component';
import { StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from './reducers/tools.reducer';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		GoToModule,
		StoreModule.forFeature(toolsFeatureKey, ToolsReducer)
	],
	declarations: [ToolsComponent, OverlaysDisplayModeComponent, AnnotationsControlComponent],
	entryComponents: [ToolsComponent]
})

export class ToolsModule {


	static forRoot(config: IToolsConfig): ModuleWithProviders {
		return {
			ngModule: ToolsModule,
			providers: [
				{ provide: toolsConfig, useValue: config }
			]
		};
	}

}
