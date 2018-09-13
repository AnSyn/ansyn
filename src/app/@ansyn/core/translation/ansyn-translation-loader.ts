import { TranslateLoader } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export class AnsynTranslationLoader implements TranslateLoader {

	constructor(protected http: HttpClient, public translationProviders: TranslateLoader[] = []) {
	}

	getTranslation(lang: string): Observable<any> {
		if (!this.translationProviders.length) {
			return of({});
		}

		return forkJoin(this.translationProviders.map((translationProvider: TranslateLoader) => translationProvider.getTranslation(lang)))
			.pipe(map((results) => {
				return results.reduce((prev, currentObject) => {
					return { ...prev, ...currentObject };
				}, {});
			}));
	}

}
