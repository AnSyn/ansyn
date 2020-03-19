import { Injectable } from '@angular/core';
import { CommunicatorEntity, EPSG_4326, ProjectionService } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import * as proj from 'ol/proj';
import OLGeoJSON from 'ol/format/GeoJSON';
import './free-layer-projection';

@Injectable({
	providedIn: 'root'
})
export class OpenLayersProjectionService extends ProjectionService {

	private olGeoJSON: OLGeoJSON = new OLGeoJSON();

	/* points */

	projectAccurately(point: Point, mapObject: any): Observable<Point> {
		return this.projectApproximately(point, mapObject);
	}

	projectAccuratelyToImage<Position>(point: Point, mapObject: any): Observable<Point> {
		return this.projectApproximatelyToImage(point, mapObject);
	}

	projectApproximatelyToImage<olGeometry>(point: Point, mapObject: any): Observable<Point> {
		const projection = mapObject.getView().getProjection();
		point.coordinates = proj.fromLonLat(<[number, number]>point.coordinates, projection);
		return of(point);
	}

	projectApproximately(point: Point, mapObject: any): Observable<Point> {
		const projection = mapObject.getView().getProjection();
		point.coordinates = proj.toLonLat(<[number, number]>point.coordinates, projection);
		return of(point);
	}

	projectApproximatelyFromProjection(point: Point, sourceProjection: string, destProjection: string): Observable<Point> {
		if (sourceProjection === destProjection) {
			return of(point);
		}
		// there is no direct proj transform from 2 pixel's projections
		point.coordinates = proj.transform(<[number, number]>point.coordinates, sourceProjection, EPSG_4326);
		point.coordinates = proj.transform(<[number, number]>point.coordinates, EPSG_4326, destProjection);
		return of(point);
	}

	/* collections */

	projectCollectionAccuratelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, mapObject: any): Observable<olFeature[]> {
		return this.projectCollectionApproximatelyToImage(featureCollection, mapObject);
	}


	projectCollectionAccurately<olFeature>(features: olFeature[] | any, mapObject: any): Observable<FeatureCollection<GeometryObject>> {
		return this.projectCollectionApproximately(features, mapObject);
	}

	projectCollectionApproximatelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, mapObject: any): Observable<olFeature[]> {
		const view = mapObject.getView();
		const featureProjection = view.getProjection();
		const dataProjection = EPSG_4326;
		const options = { featureProjection, dataProjection };
		const features: olFeature[] = <any>this.olGeoJSON.readFeatures(featureCollection, options);
		return of(features);
	}

	projectCollectionApproximately<olFeature>(features: olFeature[] | any, mapObject: any): Observable<FeatureCollection<GeometryObject>> {
		const featureProjection = mapObject.getView().getProjection();
		const dataProjection = EPSG_4326;
		const options = { featureProjection, dataProjection };
		const geoJsonFeature = <any>this.olGeoJSON.writeFeaturesObject(features, options);
		return of(geoJsonFeature);
	}

	getProjectionProperties(communicator: CommunicatorEntity, annotationLayer: any, feature: any, overlay: any): Object {
		return undefined;
	}

}
