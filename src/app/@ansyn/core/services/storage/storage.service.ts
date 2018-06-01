import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ICoreConfig } from '../../models/core.config.model';
import { CoreConfig } from '../../models/core.config';

export interface Entity {
	creationTime: Date;
	id: string;
}

export interface StoredEntity<P extends Entity, D> {
	preview: P;
	data: D;
}

/*
* Type aliasing is not supported by TypeScript https://github.com/Microsoft/TypeScript/issues/7061
 */

@Injectable()
export class StorageService {
	constructor(protected _http: HttpClient,
				@Inject(CoreConfig) public config: ICoreConfig) {}

	private _buildSchemaUrl(schema: string) {
		return `${this.config.storageService.baseUrl}/${schema}`;
	}

	private _buildIdUrl(schema: string, id: string) {
		return `${this._buildSchemaUrl(schema)}/${id}`;
	}

	private _buildEntityUrl<P extends Entity, D>(schema: string, entity: StoredEntity<P, D>) {
		return this._buildIdUrl(schema, entity.preview.id);
	}

	getPage<P extends Entity>(schema: string, offset: number, pageSize: number): Observable<P[]> {
		const url = this._buildSchemaUrl(schema);
		return this._http.get<P[]>(url, {
			params: {
				from: offset.toString(),
				limit: pageSize.toString()
			}
		});
	}

	get<P extends Entity, D>(schema: string, id: string): Observable<StoredEntity<P, D>> {
		const url = this._buildIdUrl(schema, id);
		return this._http.get<StoredEntity<P, D>>(url);
	}

	delete(schema: string, id: string): Observable<Object> {
		const url = this._buildIdUrl(schema, id);
		return this._http.delete(url);
	}

	create<P extends Entity, D>(schema: string, entity: StoredEntity<P, D>): Observable<StoredEntity<P, D>> {
		const url = this._buildEntityUrl(schema, entity);
		return this._http.post<StoredEntity<P, D>>(url, entity);
	}

	update<P extends Entity, D>(schema: string, entity: StoredEntity<P, D>): Observable<StoredEntity<P, D>> {
		const url = this._buildEntityUrl(schema, entity);
		return this._http.put<StoredEntity<P, D>>(url, entity);
	}

}
