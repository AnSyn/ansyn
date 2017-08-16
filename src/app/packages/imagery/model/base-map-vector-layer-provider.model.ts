import { Observable } from 'rxjs/Observable';

export abstract class BaseMapVectorLayerProvider {

	mapType: string;

	sourceType:  string;

	abstract create(metaData: any): any;

	abstract createAsync(metaData: any): Observable<any>;
}
