import { Injectable } from '@angular/core';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { IMap } from '@ansyn/imagery/index';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Point, Position } from 'geojson';
import proj from 'ol/proj';
import OLGeoJSON from 'ol/format/geojson';
import olFeature from 'ol/feature';
import * as ol from 'openlayers';
import * as turf from '@turf/turf'
@Injectable()
export class OpenLayersProjectionService extends ProjectionService {

	private default4326GeoJSONFormat: OLGeoJSON = new OLGeoJSON();

	/* points */

	projectAccurately(point: Point, map: IMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		point.coordinates = proj.fromLonLat(point.coordinates, projection);
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
		const projection = view.getProjection();

		// const featuresCollectionGeojson = JSON.stringify(featureCollection);
		const features: olFeature[] = <any> this.default4326GeoJSONFormat.readFeatures(featureCollection, {
			featureProjection: projection.getCode(),
			dataProjection: 'EPSG:4326'
		});

		return Observable.of(features);
	}


	projectCollectionAccurately<olFeature>(features: olFeature[] | any, map: IMap): Observable<FeatureCollection<GeometryObject>> {
		const featureProjection = map.mapObject.getView().getProjection();

		const geoJsonFeature: FeatureCollection<GeometryObject> = <any> this.default4326GeoJSONFormat.writeFeaturesObject(features, {
			featureProjection,
			dataProjection: 'EPSG:4326'
		});

		return Observable.of(geoJsonFeature);
	}

	projectCollectionApproximatelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<olFeature[]> {
		return this.projectCollectionAccuratelyToImage(featureCollection, map);
	}

	projectCollectionApproximately<olFeature>(features: olFeature[], map: IMap): Observable<FeatureCollection<GeometryObject>> {
		return this.projectCollectionAccurately(features, map);
	}

}
