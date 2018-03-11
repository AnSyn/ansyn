import { Injectable } from '@angular/core';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { IMap } from '@ansyn/imagery/index';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Point, Position } from 'geojson';
import proj from 'ol/proj';
import OLGeoJSON from 'ol/format/geojson';
import olFeature from 'ol/feature';
import * as ol from 'openlayers';

@Injectable()
export class OpenLayersProjectionService extends ProjectionService {

	private default4326GeoJSONFormat: OLGeoJSON = new OLGeoJSON();

	projectCollectionAccuratelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<olFeature[]> {
		const view = map.mapObject.getView();
		const projection = view.getProjection();

		const featuresCollectionGeojson = JSON.stringify(featureCollection);
		const features: olFeature[] = <any> this.default4326GeoJSONFormat.readFeatures(featuresCollectionGeojson, {
			dataProjection: 'EPSG:4326',
			featureProjection: projection.getCode()
		});

		return Observable.of(features);
	}

	projectCollectionApproximatelyToImage<olFeature>(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<olFeature[]> {
		return this.projectCollectionAccuratelyToImage(featureCollection, map);
	}

	projectAccuratelyToImage<olGeometry>(geometry: GeometryObject, map: IMap): Observable<olGeometry> {
		const view = map.mapObject.getView();
		const projection = view.getProjection();

		const newGeometry: olGeometry = <any> this.default4326GeoJSONFormat.readGeometry(geometry, {
			dataProjection: 'EPSG:4326',
			featureProjection: projection.getCode()
		});

		return Observable.of(newGeometry);
	}

	projectApproximatelyToImage<olGeometry>(geometry: GeometryObject, map: IMap): Observable<olGeometry> {
		return this.projectAccuratelyToImage(geometry, map);
	}

	projectAccurately(pixel: Position, map: IMap): Observable<Point> {
		const projection = map.mapObject.getView().getProjection();
		const projectedCoord = proj.toLonLat(pixel, projection);
		const projectedPoint: Point = { type: 'Point', coordinates: projectedCoord };
		return Observable.of(projectedPoint);
	}

	projectApproximately(pixel: Position, map: IMap): Observable<Point> {
		return this.projectAccurately(pixel, map);
	}

	projectCollectionAccurately<olFeature>(features: olFeature[] | any, map: IMap): Observable<FeatureCollection<GeometryObject>> {
		const featureProjection = map.mapObject.getView().getProjection();

		const geoJsonFeature: FeatureCollection<GeometryObject> = <any> this.default4326GeoJSONFormat.writeFeaturesObject(features, {
			featureProjection,
			dataProjection: 'EPSG:4326'
		});

		return Observable.of(geoJsonFeature);
	}

	projectCollectionApproximately<olFeature>(features: olFeature[], map: IMap): Observable<FeatureCollection<GeometryObject>> {
		return this.projectCollectionAccurately(features, map);
	}

}
