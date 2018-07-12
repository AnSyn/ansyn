import { Observable } from 'rxjs';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import { BaseImageryMap } from '../model/base-imagery-map';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';

export abstract class ProjectionService {
	/* Image to ground */

	// image point
	abstract projectAccurately(point: Point, map: BaseImageryMap): Observable<Point>;
	abstract projectApproximately(point: Point, map: BaseImageryMap): Observable<Point>;

	// image collection
	abstract projectCollectionAccurately<T = any>(features: T[], map: BaseImageryMap): Observable<FeatureCollection<GeometryObject>>;
	abstract projectCollectionApproximately<T = any>(features: T[], map: BaseImageryMap): Observable<FeatureCollection<GeometryObject>>;

	/* Ground to image */

	// ground point
	abstract projectAccuratelyToImage(point: Point, map: BaseImageryMap): Observable<Point>;
	abstract projectApproximatelyToImage(point: Point, map: BaseImageryMap): Observable<Point>;

	// ground collection
	abstract projectCollectionAccuratelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, map: BaseImageryMap): Observable<T[]>;
	abstract projectCollectionApproximatelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, map: BaseImageryMap): Observable<T[]>;


	abstract getProjectionProperties(communicator: CommunicatorEntity): Object
}
