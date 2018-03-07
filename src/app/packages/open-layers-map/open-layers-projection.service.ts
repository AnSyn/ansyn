import { Injectable } from '@angular/core';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { IMap } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeometryObject, Point, Position } from 'geojson';
import proj from 'ol/proj';
import OLGeoJSON from 'ol/format/geojson';

@Injectable()
export class OpenLayersProjectionService extends ProjectionService {

	private default4326GeoJSONFormat: OLGeoJSON = new OLGeoJSON({
		defaultDataProjection: 'EPSG:4326',
		featureProjection: 'EPSG:4326'
	});

	projectCollectionAccuratelyToImage(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<any> {
		const view = map.mapObject.getView();
		const projection = view.getProjection();

		const featuresCollectionGeojson = JSON.stringify(featureCollection);
		const features = this.default4326GeoJSONFormat.readFeatures(featuresCollectionGeojson, {
			dataProjection: 'EPSG:4326',
			featureProjection: projection.getCode()
		});

		return Observable.of(features);
	}

	projectCollectionApproximatelyToImage(featureCollection: FeatureCollection<GeometryObject>, map: IMap): Observable<GeometryObject> {
		return this.projectCollectionAccuratelyToImage(featureCollection, map);
	}

	projectAccuratelyToImage(feature: GeometryObject, map: IMap): Observable<any> {
		const view = map.mapObject.getView();
		const projection = view.getProjection();

		const newGeometry = this.default4326GeoJSONFormat.readGeometry(feature, {
			dataProjection: 'EPSG:4326',
			featureProjection: projection.getCode()
		});

		return Observable.of(newGeometry);
	}

	projectApproximatelyToImage(feature: GeometryObject, map: IMap): Observable<GeometryObject> {
		return this.projectAccuratelyToImage(feature, map);
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

}
