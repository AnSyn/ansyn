import { Injectable } from '@angular/core';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Point } from 'geojson';
import proj from 'ol/proj';
import OLGeoJSON from 'ol/format/geojson';
import { IMap } from '@ansyn/imagery/model/imap';

@Injectable()
export class OpenLayersProjectionService extends ProjectionService {

	private olGeoJSON: OLGeoJSON = new OLGeoJSON();

	/* points */

	projectAccurately(point: Point, map: IMap): Observable<Point> {
		return this.projectApproximately(point, map);
	}

	projectAccuratelyToImage<Position>(point: Point, map: IMap): Observable<Point> {
		return this.projectApproximatelyToImage(point, map);
	}

	projectApproximatelyToImage<olGeometry>(point: Point, map: IMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.fromLonLat(point.coordinates, projection);
		return Observable.of(point);
	}

	projectApproximately(point: Point, map: IMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.toLonLat(point.coordinates, projection);
		return Observable.of(point);
	}

	/* collections */

	projectCollectionAccuratelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<olFeature[]> {
		return this.projectCollectionApproximatelyToImage(featureCollection, map);
	}


	projectCollectionAccurately<olFeature>(features: olFeature[] | any, map: IMap): Observable<FeatureCollection<GeometryObject>> {
		return this.projectCollectionApproximately(features, map);
	}

	projectCollectionApproximatelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<olFeature[]> {
		const view = map.mapObject.getView();
		const featureProjection = view.getProjection();
		const dataProjection = 'EPSG:4326';
		const options = { featureProjection, dataProjection };
		const features: olFeature[] = <any> this.olGeoJSON.readFeatures(featureCollection, options);
		return Observable.of(features);
	}

	projectCollectionApproximately<olFeature>(features: olFeature[] | any, map: IMap): Observable<FeatureCollection<GeometryObject>> {
		const featureProjection = map.mapObject.getView().getProjection();
		const dataProjection = 'EPSG:4326';
		const options = { featureProjection, dataProjection };
		const geoJsonFeature = <any> this.olGeoJSON.writeFeaturesObject(features, options);
		return Observable.of(geoJsonFeature);
	}

}
