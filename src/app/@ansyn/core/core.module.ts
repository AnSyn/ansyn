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
import { AlertsModule } from '@ansyn/core/alerts/alerts.module';
import { WelcomeNotificationComponent } from '@ansyn/core/components/welcome-notification/welcome-notification.component';
import { GenericTypeResolverService } from '@ansyn/core/services/generic-type-resolver.service';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { StorageService } from '@ansyn/core/services/storage/storage.service';

const coreComponents = [
	AnsynCheckboxComponent,
	ImageryStatusComponent,
	PlaceholderComponent,
	ToastComponent,
	WelcomeNotificationComponent
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
		ErrorHandlerService,
		StorageService
	],
	exports: coreComponents,
	declarations: coreComponents
})

export class CoreModule {

}
