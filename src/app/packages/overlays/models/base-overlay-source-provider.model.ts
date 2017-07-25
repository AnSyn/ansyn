import { Overlay } from '@ansyn/core'
import { Observable } from "rxjs/Observable";

export interface IFetchParams {
    region : GeoJSON.DirectGeometryObject;
    timeRange : {
        start: Date,
        end: Date
    }
}

export abstract class BaseOverlaySourceProvider {
    sourceType : string;
    public fetch(fetchParams : IFetchParams) : Observable<Overlay[]> {
        return Observable.empty();
    };
	public getStartDateViaLimitFasets(params: {facets, limit, region}): Observable<any> {
		return Observable.empty();
	};
}
