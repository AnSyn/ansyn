import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { get } from 'lodash';
import { ITranslateConfigModel, TranslateConfig } from '../translate.config.model';

@Injectable()
export class DefaultTranslateLoader implements TranslateLoader {

	constructor(@Inject(TranslateConfig) public translateConfig: ITranslateConfigModel) {
	}

	getTranslation(lang: string): Observable<any> {
		return of(get(this.translateConfig, 'translation.default'));
	}

}
