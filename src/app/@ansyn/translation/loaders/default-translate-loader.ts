import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ICoreConfig } from '../../ansyn/modules/core/models/core.config.model';
import { Inject, Injectable } from '@angular/core';
import { CoreConfig } from '../../ansyn/modules/core/models/core.config';
import { get } from 'lodash';

@Injectable()
export class DefaultTranslateLoader implements TranslateLoader {

	constructor(@Inject(CoreConfig) public coreConfig: ICoreConfig) {
	}

	getTranslation(lang: string): Observable<any> {
		return of(get(this.coreConfig, 'translation.default'));
	}

}
