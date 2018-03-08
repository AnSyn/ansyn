import { Observable } from 'rxjs/Observable';
import { GeometryObject, Point, Position } from 'geojson';
import { IMap } from '@ansyn/imagery/index';

export abstract class ProjectionService {
	// Image to ground
	abstract projectAccurately(pixel: Position, map: IMap): Observable<Point>;
	abstract projectApproximately(pixel: Position, map: IMap): Observable<Point>;

	// Ground to image
	abstract projectAccuratelyToImage(feature: GeometryObject, map: IMap): Observable<any>;
	abstract projectApproximatelyToImage(feature: GeometryObject, map: IMap): Observable<any>;
	abstract projectCollectionAccuratelyToImage(featureCollection: GeoJSON.FeatureCollection<GeometryObject>, map: IMap): Observable<any>;
	abstract projectCollectionApproximatelyToImage(featureCollection: GeoJSON.FeatureCollection<GeometryObject>, map: IMap): Observable<any>;
}
