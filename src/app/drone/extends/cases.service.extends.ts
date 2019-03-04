import { Inject, Injectable } from '@angular/core';
import { ErrorHandlerService, ICase, ICasePreview, StorageService } from '@ansyn/core';
import { UrlSerializer } from '@angular/router';
/* Do not change this ( rollup issue ) */
import { CasesService, ICasesConfig } from '@ansyn/menu-items';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { AuthService } from '../../app/login/services/auth.service';
import { StorageServiceExtends } from './storage.service.extends';

export const casesConfig = 'casesConfig';

// @dynamic
@Injectable()
export class CasesServiceExtends extends CasesService {
	storageServiceExtends: StorageServiceExtends = this.storageService;

	constructor(protected storageService: StorageService,
				@Inject(casesConfig) public config: ICasesConfig,
				public urlSerializer: UrlSerializer,
				public errorHandlerService: ErrorHandlerService,
				protected authService: AuthService
	) {
		super(storageService, config, urlSerializer, errorHandlerService);
	}

	loadCases(casesOffset: number = 0): Observable<any> {
		return this.storageServiceExtends.getPage<ICasePreview>(this.config.schema, casesOffset, this.paginationLimit, this.authService.user.role)
			.pipe(
				map(previews => previews.map(preview => this.parseCasePreview(preview))),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load cases'))
			);
	}

	getPreview(caseValue: ICase): ICasePreview {
		const casePreview: ICasePreview = super.getPreview(caseValue);

		if (caseValue.role) {
			casePreview.role = caseValue.role;
		}

		return casePreview;
	}

}
