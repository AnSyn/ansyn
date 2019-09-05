import { Injectable } from '@angular/core';
import { BaseImageryMap, CommunicatorEntity } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import { FeatureCollection, GeometryObject, Point } from 'geojson';

@Injectable({
	providedIn: 'root'
})
export class CesiumProjectionService /* extends ProjectionService */ {

	/* points */
	projectAccurately(point: Point, map: BaseImageryMap): Observable<Point> {
		return this.projectApproximately(point, map);
	}

	projectAccuratelyToImage<Position>(point: Point, map: BaseImageryMap): Observable<Point> {
		return of(point);
	}

	projectApproximatelyToImage<olGeometry>(point: Point, map: BaseImageryMap): Observable<Point> {
		return of(point);
	}

	projectApproximately(point: Point, map: BaseImageryMap): Observable<Point> {
		return of(point);
	}

	projectApproximatelyFromProjection(point: Point, sourceProjection: string, destProjection: string): Observable<Point> {
		return of(point);
	}

	/* collections */
	projectCollectionAccuratelyToImage(featureCollection: any, map: BaseImageryMap): Observable<any> {
		return this.projectCollectionApproximatelyToImage(featureCollection, map);
	}

	projectCollectionAccurately(features: any, map: BaseImageryMap): Observable<any> {
		return this.projectCollectionApproximately(features, map);
	}

	projectCollectionApproximatelyToImage<olFeature>(featureCollection: any, map: BaseImageryMap): Observable<any> {
		return of(featureCollection);
	}

	projectCollectionApproximately<olFeature>(features: FeatureCollection<GeometryObject> | any, map: BaseImageryMap): Observable<any> {
		return of(features);
	}

	getProjectionProperties(communicator: CommunicatorEntity, annotationLayer: any, feature: any, overlay: any): Object {
		return undefined;
	}

}
