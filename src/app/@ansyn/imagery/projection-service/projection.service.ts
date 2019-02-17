import { Observable } from 'rxjs';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';

export abstract class ProjectionService {
	/* Image to ground */

	// image point
	abstract projectAccurately(point: Point, mapObject: any): Observable<Point>;

	abstract projectApproximately(point: Point, mapObject: any): Observable<Point>;

	abstract projectApproximatelyFromProjection(point: Point, sourceProjection: string, destProjection: string): Observable<Point>;

	// image collection
	abstract projectCollectionAccurately<T = any>(features: T[], mapObject: any): Observable<FeatureCollection<GeometryObject>>;

	abstract projectCollectionApproximately<T = any>(features: T[], mapObject: any): Observable<FeatureCollection<GeometryObject>>;

	/* Ground to image */

	// ground point
	abstract projectAccuratelyToImage(point: Point, mapObject: any): Observable<Point>;

	abstract projectApproximatelyToImage(point: Point, mapObject: any): Observable<Point>;

	// ground collection
	abstract projectCollectionAccuratelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, mapObject: any): Observable<T[]>;

	abstract projectCollectionApproximatelyToImage<T = any>(featureCollection: FeatureCollection<GeometryObject>, mapObject: any): Observable<T[]>;


	abstract getProjectionProperties(communicator: CommunicatorEntity, annotationLayer: any, feature: any, overlay: any): Object

}
