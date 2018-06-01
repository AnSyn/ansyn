import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import { IMap } from '@ansyn/imagery/model/imap';

export abstract class ProjectionService {
	/* Image to ground */

	// image point
	abstract projectAccurately(point: Point, map: IMap): Observable<Point>;
	abstract projectApproximately(point: Point, map: IMap): Observable<Point>;

	// image collection
	abstract projectCollectionAccurately<T = any>(features: T[], map: IMap): Observable<FeatureCollection<GeometryObject>>;
	abstract projectCollectionApproximately<T = any>(features: T[], map: IMap): Observable<FeatureCollection<GeometryObject>>;

	/* Ground to image */

	// ground point
	abstract projectAccuratelyToImage(point: Point, map: IMap): Observable<Point>;
	abstract projectApproximatelyToImage(point: Point, map: IMap): Observable<Point>;

	// ground collection
	abstract projectCollectionAccuratelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<T[]>;
	abstract projectCollectionApproximatelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<T[]>;
}
