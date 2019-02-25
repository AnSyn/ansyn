import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { ICoreConfig } from '../../models/core.config.model';
import { CoreConfig } from '../../models/core.config';

export interface IEntity {
	creationTime: Date;
	id: string;
}

export interface IStoredEntity<P extends IEntity, D> {
	preview: P;
	data?: D;
}

/*
* Type aliasing is not supported by TypeScript https://github.com/Microsoft/TypeScript/issues/7061
 */

@Injectable()
export class StorageService {
	constructor(protected _http: HttpClient,
				@Inject(CoreConfig) public config: ICoreConfig) {
	}

	private _buildSchemaUrl(schema: string) {
		return `${this.config.storageService.baseUrl}/${schema}`;
	}

	private _buildIdUrl(schema: string, id: string) {
		return `${this._buildSchemaUrl(schema)}/${id}`;
	}

	private _buildEntityUrl<P extends IEntity, D>(schema: string, entity: IStoredEntity<P, D>) {
		return this._buildIdUrl(schema, entity.preview.id);
	}

	searchByCase<P extends IEntity>(schema: string, body): Observable<P[]> {
		const url = this._buildSchemaUrl(schema);
		const promise = fetch(`${url}/search_by_case`, { method: 'POST', body: JSON.stringify(body) })
			.then(response => response.json());
		return from(promise);
	}

	deleteByCase<P extends IEntity>(schema: string, body): Observable<P[]> {
		const url = this._buildSchemaUrl(schema);
		return this._http.post<P[]>(`${url}/delete_by_case`, body);
	}

	getPage<P extends IEntity>(schema: string, offset: number, pageSize: number): Observable<P[]> {
		const url = this._buildSchemaUrl(schema);
		return this._http.get<P[]>(url, {
			params: {
				from: offset.toString(),
				limit: pageSize.toString()
			}
		});
	}

	get<P extends IEntity, D>(schema: string, id: string): Observable<IStoredEntity<P, D>> {
		const url = this._buildIdUrl(schema, id);
		return this._http.get<IStoredEntity<P, D>>(url);
	}

	delete(schema: string, id: string): Observable<Object> {
		const url = this._buildIdUrl(schema, id);
		return this._http.delete(url);
	}

	create<P extends IEntity, D>(schema: string, entity: IStoredEntity<P, D>): Observable<IStoredEntity<P, D>> {
		const url = this._buildEntityUrl(schema, entity);
		return this._http.post<IStoredEntity<P, D>>(url, entity);
	}

	update<P extends IEntity, D>(schema: string, entity: IStoredEntity<P, D>): Observable<IStoredEntity<P, D>> {
		const url = this._buildEntityUrl(schema, entity);
		return this._http.put<IStoredEntity<P, D>>(url, entity);
	}

}
