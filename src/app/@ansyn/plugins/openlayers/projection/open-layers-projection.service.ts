import { Injectable } from '@angular/core';
import { BaseImageryMap, CommunicatorEntity, ProjectionService } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import proj from 'ol/proj';
import OLGeoJSON from 'ol/format/geojson';

@Injectable({
	providedIn: 'root'
})
export class OpenLayersProjectionService extends ProjectionService {

	private olGeoJSON: OLGeoJSON = new OLGeoJSON();

	/* points */

	projectAccurately(point: Point, map: BaseImageryMap): Observable<Point> {
		return this.projectApproximately(point, map);
	}

	projectAccuratelyToImage<Position>(point: Point, map: BaseImageryMap): Observable<Point> {
		return this.projectApproximatelyToImage(point, map);
	}

	projectApproximatelyToImage<olGeometry>(point: Point, map: BaseImageryMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.fromLonLat(<[number, number]>point.coordinates, projection);
		return of(point);
	}

	projectApproximately(point: Point, map: BaseImageryMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.toLonLat(<[number, number]>point.coordinates, projection);
		return of(point);
	}

	projectApproximatelyFromProjection(point: Point, sourceProjection: string, destProjection: string): Observable<Point> {
		if (sourceProjection === destProjection) {
			return of(point);
		}
		// there is no direct proj transform from 2 pixel's projections
		point.coordinates = proj.transform(<[number, number]>point.coordinates, sourceProjection, 'EPSG:4326');
		point.coordinates = proj.transform(<[number, number]>point.coordinates, 'EPSG:4326', destProjection);
		return of(point);
	}

	/* collections */

	projectCollectionAccuratelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: BaseImageryMap): Observable<olFeature[]> {
		return this.projectCollectionApproximatelyToImage(featureCollection, map);
	}


	projectCollectionAccurately<olFeature>(features: olFeature[] | any, map: BaseImageryMap): Observable<FeatureCollection<GeometryObject>> {
		return this.projectCollectionApproximately(features, map);
	}

	projectCollectionApproximatelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: BaseImageryMap): Observable<olFeature[]> {
		const view = map.mapObject.getView();
		const featureProjection = view.getProjection();
		const dataProjection = 'EPSG:4326';
		const options = { featureProjection, dataProjection };
		const features: olFeature[] = <any> this.olGeoJSON.readFeatures(featureCollection, options);
		return of(features);
	}

	projectCollectionApproximately<olFeature>(features: olFeature[] | any, map: BaseImageryMap): Observable<FeatureCollection<GeometryObject>> {
		const featureProjection = map.mapObject.getView().getProjection();
		const dataProjection = 'EPSG:4326';
		const options = { featureProjection, dataProjection };
		const geoJsonFeature = <any> this.olGeoJSON.writeFeaturesObject(features, options);
		return of(geoJsonFeature);
	}

	getProjectionProperties(communicator: CommunicatorEntity, annotationLayer: any, feature: any, overlay: any): Object {
		return undefined;
	}

}
