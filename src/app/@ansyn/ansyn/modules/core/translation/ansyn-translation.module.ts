import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MissingTranslationLogging } from '../utils/missing-translation-logging';
import { HttpClient } from '@angular/common/http';
import { AnsynTranslationLoader } from './ansyn-translation-loader';

export const ROOT_TRANSLATION_PROVIDERS = new InjectionToken('ROOT_TRANSLATION_PROVIDERS');
export const TRANSLATION_PROVIDERS = new InjectionToken('TRANSLATION_PROVIDERS');

export function TranslationsProvidersFactory(providers) {
	return providers.reduce((a, ps) => [...a, ...ps], []);
}

export function RootTranslationsProvidersFactory(...mapSourceProviders) {
	return mapSourceProviders;
}

export function HttpLoaderFactory(http: HttpClient, translationProviders: TranslateLoader[]) {
	return new AnsynTranslationLoader(http, translationProviders);
}

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		TranslateModule.forRoot({
			missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingTranslationLogging },
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient, TRANSLATION_PROVIDERS]
			},
			useDefaultLang: true
		})
	],
	providers: [
		{
			provide: TRANSLATION_PROVIDERS,
			useFactory: TranslationsProvidersFactory,
			deps: [ROOT_TRANSLATION_PROVIDERS]

		}
	],
	exports: [TranslateModule]
})
export class AnsynTranslationModule {
	static addLoader(providers: Array<new(...args) => TranslateLoader>): ModuleWithProviders<AnsynTranslationModule> {
		return {
			ngModule: AnsynTranslationModule,
			providers: [
				providers,
				{
					provide: ROOT_TRANSLATION_PROVIDERS,
					useFactory: RootTranslationsProvidersFactory,
					deps: providers,
					multi: true
				}
			]
		};
	}
}
