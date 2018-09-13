import { Injectable } from '@angular/core';
import { BaseImageryMap, CommunicatorEntity, ProjectionService } from '@ansyn/imagery';
import { Observable } from 'rxjs';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import proj from 'ol/proj';
import OLGeoJSON from 'ol/format/geojson';

@Injectable()
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
		return Observable.of(point);
	}

	projectApproximately(point: Point, map: BaseImageryMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.toLonLat(<[number, number]>point.coordinates, projection);
		return Observable.of(point);
	}

	projectApproximatelyFromProjection(point: Point, projection: ol.ProjectionLike): Observable<Point> {
		point.coordinates = proj.toLonLat(<[number, number]>point.coordinates, projection);
		return Observable.of(point);
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
		return Observable.of(features);
	}

	projectCollectionApproximately<olFeature>(features: olFeature[] | any, map: BaseImageryMap): Observable<FeatureCollection<GeometryObject>> {
		const featureProjection = map.mapObject.getView().getProjection();
		const dataProjection = 'EPSG:4326';
		const options = { featureProjection, dataProjection };
		const geoJsonFeature = <any> this.olGeoJSON.writeFeaturesObject(features, options);
		return Observable.of(geoJsonFeature);
	}

	getProjectionProperties(communicator: CommunicatorEntity, annotationLayer: any, feature: any, overlay: any): Object {
		return undefined;
	}

}
