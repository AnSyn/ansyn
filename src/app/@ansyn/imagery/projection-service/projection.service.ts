import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Point, Position } from 'geojson';
import { IMap } from '@ansyn/imagery/index';

export abstract class ProjectionService {
	// Image to ground projection -> EPSG:4326
	abstract projectAccurately(pixel: Position, map: IMap): Observable<Point>;
	abstract projectApproximately(pixel: Position, map: IMap): Observable<Point>;
	abstract projectCollectionAccurately<T = any>(features: T[], map: IMap): Observable<FeatureCollection<GeometryObject>>;
	abstract projectCollectionApproximately<T = any>(features: T[], map: IMap): Observable<FeatureCollection<GeometryObject>>;

	// Ground to image  EPSG:4326 -> projection
	abstract projectAccuratelyToImage<T = any>(feature: GeometryObject, map: IMap): Observable<T>;
	abstract projectApproximatelyToImage<T = any>(feature: GeometryObject, map: IMap): Observable<T>;
	abstract projectCollectionAccuratelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<T[]>;
	abstract projectCollectionApproximatelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<T[]>;
}
