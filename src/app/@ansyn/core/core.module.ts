import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
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
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService } from '@ngx-translate/core';
import { ILoggerConfig } from './models/logger-config.model';
import { LoggerConfig } from './models/logger.config';


export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http);
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
	constructor(public logger: LoggerService,
				@Inject(LoggerConfig) public loggerConfig: ILoggerConfig) {

	}

	handle(params: MissingTranslationHandlerParams) {
		this.logger.warn(`Cannot find ${params.key}`);
		return params.key;
	}
}

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
		TranslateModule.forRoot({
			missingTranslationHandler: {provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler},
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			},
			useDefaultLang: true
		}),
		AlertsModule
	],
	providers: [
		GenericTypeResolverService,
		LoggerService,
		ErrorHandlerService,
		StorageService
	],
	exports: coreComponents,
	declarations: coreComponents
})

export class CoreModule {
	constructor(public translate: TranslateService) {
		translate.setDefaultLang('sns');
	}
}
