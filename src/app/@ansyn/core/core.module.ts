import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { StoreModule } from '@ngrx/store';
import { coreFeatureKey, CoreReducer } from './reducers/core.reducer';
import { ToastComponent } from './components/toast/toast.component';
import { EffectsModule } from '@ngrx/effects';
import { CoreEffects } from './effects/core.effects';
import { CoreService } from './services/core.service';
import {
	ErrorHandlerService, GenericTypeResolverService, LoggerService,
	ProjectionConverterService
} from './services';
import { AlertsModule } from '@ansyn/core/alerts/alerts.module';


const coreComponents = [
	AnsynCheckboxComponent,
	ImageryStatusComponent,
	PlaceholderComponent,
	ToastComponent
];

@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(coreFeatureKey, CoreReducer),
		EffectsModule.forFeature([CoreEffects]),
		AlertsModule
	],
	providers: [
		GenericTypeResolverService,
		ProjectionConverterService,
		LoggerService,
		CoreService,
		ErrorHandlerService
	],
	exports: coreComponents,
	declarations: coreComponents
})

export class CoreModule {

}
