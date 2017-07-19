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
    public fetch(fetchParams : IFetchParams) : Observable<Array<Overlay>> {
        return Observable.empty();
    };
}
