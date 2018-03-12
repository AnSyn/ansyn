import { Injectable } from '@angular/core';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { IMap } from '@ansyn/imagery/index';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import proj from 'ol/proj';
import OLGeoJSON from 'ol/format/geojson';

@Injectable()
export class OpenLayersProjectionService extends ProjectionService {

	private olGeoJSON: OLGeoJSON = new OLGeoJSON();

	/* points */

	projectAccurately(point: Point, map: IMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.toLonLat(point.coordinates, projection);
		return Observable.of(point);
	}

	projectAccuratelyToImage<Position>(point: Point, map: IMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.fromLonLat(point.coordinates, projection);
		return Observable.of(point);
	}

	projectApproximatelyToImage<olGeometry>(point: Point, map: IMap): Observable<Point> {
		return this.projectAccuratelyToImage(point, map);
	}

	projectApproximately(point: Point, map: IMap): Observable<Point> {
		return this.projectAccurately(point, map);
	}

	/* collections */

	projectCollectionAccuratelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<olFeature[]> {
		const view = map.mapObject.getView();
		const featureProjection = view.getProjection();
		const dataProjection = 'EPSG:4326';
		const options = { featureProjection, dataProjection };
		const features: olFeature[] = <any> this.olGeoJSON.readFeatures(featureCollection, options);
		return Observable.of(features);
	}


	projectCollectionAccurately<olFeature>(features: olFeature[] | any, map: IMap): Observable<FeatureCollection<GeometryObject>> {
		const featureProjection = map.mapObject.getView().getProjection();
		const dataProjection = 'EPSG:4326';
		const options = { featureProjection, dataProjection };
		const geoJsonFeature = <any> this.olGeoJSON.writeFeaturesObject(features, options);
		return Observable.of(geoJsonFeature);
	}

	projectCollectionApproximatelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<olFeature[]> {
		return this.projectCollectionAccuratelyToImage(featureCollection, map);
	}

	projectCollectionApproximately<olFeature>(features: olFeature[], map: IMap): Observable<FeatureCollection<GeometryObject>> {
		return this.projectCollectionAccurately(features, map);
	}

}
