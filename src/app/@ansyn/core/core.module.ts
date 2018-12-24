import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressBarModule } from '@angular/material';
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
import { AnsynModalComponent } from './components/ansyn-modal/ansyn-modal.component';
import { AnsynPopoverComponent } from './components/ansyn-popover/ansyn-popover.component';
import { AnsynLoaderComponent } from './components/ansyn-loader/ansyn-loader.component';
import { ManualRemovedOverlaysComponent } from './components/manual-removed-overlays/manual-removed-overlays.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AnsynTranslationModule } from './translation/ansyn-translation.module';
import { DefaultTranslateLoader } from './translation/default-translate-loader';
import { AnimatedEllipsisComponent } from './components/animated-ellipsis/animated-ellipsis.component';
import { AnsynFormsModule } from './forms/ansyn-forms.module';
import { AnnotationsColorComponent } from './components/annotations-color/annotations-color.component';
import { AnnotationsWeightComponent } from './components/annotations-weight/annotations-weight.component';
import { UploadProgressBarComponent } from './components/upload-progress-bar/upload-progress-bar.component';

@NgModule({
	imports: [
		CommonModule,
		AnsynFormsModule,
		StoreModule.forFeature(coreFeatureKey, CoreReducer),
		EffectsModule.forFeature([CoreEffects]),
		AnsynTranslationModule.addLoader([DefaultTranslateLoader]),
		AlertsModule,
		BrowserAnimationsModule,
		MatProgressBarModule
	],
	providers: [
		GenericTypeResolverService,
		LoggerService,
		ErrorHandlerService,
		StorageService
	],
	exports: [
		ImageryStatusComponent,
		AnsynTranslationModule,
		AnsynFormsModule,
		ToastComponent,
		WelcomeNotificationComponent,
		AnsynModalComponent,
		AnsynPopoverComponent,
		AnsynLoaderComponent,
		ManualRemovedOverlaysComponent,
		ClickOutsideDirective,
		AnimatedEllipsisComponent,
		AnnotationsColorComponent,
		AnnotationsWeightComponent,
		UploadProgressBarComponent
	],
	declarations: [
		ImageryStatusComponent,
		ToastComponent,
		WelcomeNotificationComponent,
		AnsynModalComponent,
		AnsynPopoverComponent,
		AnsynLoaderComponent,
		ManualRemovedOverlaysComponent,
		ClickOutsideDirective,
		AnimatedEllipsisComponent,
		AnnotationsColorComponent,
		AnnotationsWeightComponent,
		UploadProgressBarComponent,

	]
})

export class CoreModule {
	constructor(public translate: TranslateService) {
		translate.setDefaultLang('default');
	}
}
