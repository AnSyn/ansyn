import { Injectable } from '@angular/core';
import { IEntity, StorageService } from '@ansyn/core';
import { Observable } from 'rxjs';


@Injectable()
export class StorageServiceExtends extends StorageService {
	getPage<P extends IEntity>(schema: string, offset: number, pageSize: number, role?: string): Observable<P[]> {
		const url = this._buildSchemaUrl(schema);
		const params: any = { from: offset.toString(), limit: pageSize.toString() };
		if (role) {
			params.role = role;
		}
		return this._http.get<P[]>(url, { params });
	}
}
