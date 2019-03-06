import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';
import { AnsynTranslationModule } from './translation/ansyn-translation.module';
import { DefaultTranslateLoader } from './translation/default-translate-loader';
import { AnimatedEllipsisComponent } from './components/animated-ellipsis/animated-ellipsis.component';
import { AnsynFormsModule } from './forms/ansyn-forms.module';
import { AnnotationsColorComponent } from './components/annotations-color/annotations-color.component';
import { AnnotationsWeightComponent } from './components/annotations-weight/annotations-weight.component';
import { FormsModule } from '@angular/forms';
import { BaseFetchService } from './services/base-fetch-service';
import { FetchService } from './services/fetch.service';

@NgModule({
	imports: [
		CommonModule,
		AnsynFormsModule,
		StoreModule.forFeature(coreFeatureKey, CoreReducer),
		EffectsModule.forFeature([CoreEffects]),
		AnsynTranslationModule.addLoader([DefaultTranslateLoader]),
		AlertsModule,
		BrowserAnimationsModule,
		FormsModule
	],
	providers: [
		GenericTypeResolverService,
		LoggerService,
		ErrorHandlerService,
		StorageService,
		FetchService
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
		InfiniteScrollDirective,
		AnimatedEllipsisComponent,
		AnnotationsColorComponent,
		AnnotationsWeightComponent
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
		InfiniteScrollDirective,
		AnimatedEllipsisComponent,
		AnnotationsColorComponent,
		AnnotationsWeightComponent
	]
})

export class CoreModule {
	static provideFetch(value: { new(...args): BaseFetchService }): ModuleWithProviders {
		return {
			ngModule: CoreModule,
			providers: [
				{ provide: BaseFetchService, useClass: value }
			]
		}
	}
	constructor(public translate: TranslateService) {
		translate.setDefaultLang('default');
	}
}
