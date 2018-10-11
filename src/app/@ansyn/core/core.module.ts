import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { StoreModule } from '@ngrx/store';
import { coreFeatureKey, CoreReducer } from './reducers/core.reducer';
import { ToastComponent } from './components/toast/toast.component';
import { EffectsModule } from '@ngrx/effects';
import { CoreEffects } from './effects/core.effects';
import { AlertsModule } from './alerts/alerts.module';
import { WelcomeNotificationComponent } from './components/welcome-notification/welcome-notification.component';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { LoggerService } from './services/logger.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { StorageService } from './services/storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { SliderCheckboxComponent } from './components/slider-checkbox/slider-checkbox.component';
import { AnsynModalComponent } from './components/ansyn-modal/ansyn-modal.component';
import { AnsynPopoverComponent } from './components/ansyn-popover/ansyn-popover.component';
import { AnsynLoaderComponent } from './components/ansyn-loader/ansyn-loader.component';
import { AnsynInputComponent } from './components/ansyn-input/ansyn-input.component';
import { FormsModule } from '@angular/forms';
import { ManualRemovedOverlaysComponent } from './components/manual-removed-overlays/manual-removed-overlays.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AnsynTranslationModule } from './translation/ansyn-translation.module';
import { DefaultTranslateLoader } from './translation/default-translate-loader';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		StoreModule.forFeature(coreFeatureKey, CoreReducer),
		EffectsModule.forFeature([CoreEffects]),
		AnsynTranslationModule.addLoader([DefaultTranslateLoader]),
		AlertsModule
	],
	providers: [
		GenericTypeResolverService,
		LoggerService,
		ErrorHandlerService,
		StorageService
	],
	exports: [
		AnsynCheckboxComponent,
		ImageryStatusComponent,
		AnsynTranslationModule,
		ToastComponent,
		WelcomeNotificationComponent,
		SliderCheckboxComponent,
		AnsynModalComponent,
		AnsynPopoverComponent,
		AnsynLoaderComponent,
		AnsynInputComponent,
		ManualRemovedOverlaysComponent,
		ClickOutsideDirective
	],
	declarations: [
		AnsynCheckboxComponent,
		ImageryStatusComponent,
		ToastComponent,
		WelcomeNotificationComponent,
		SliderCheckboxComponent,
		AnsynModalComponent,
		AnsynPopoverComponent,
		AnsynLoaderComponent,
		AnsynInputComponent,
		ManualRemovedOverlaysComponent,
		ClickOutsideDirective
	]
})

export class CoreModule {
	constructor(public translate: TranslateService) {
		translate.setDefaultLang('default');
	}
}
