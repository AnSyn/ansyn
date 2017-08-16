import { BaseMapVectorLayerProvider } from '@ansyn/imagery';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { Observable } from 'rxjs/Observable';

export const OpenLayerOSMVectorLayerProviderMapType = 'openLayersMap';
export const OpenLayerOSMVectorLayerProviderSourceType = 'OSM';

export class OpenLayerOSMVectorLayerProvider extends BaseMapVectorLayerProvider {
	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerOSMVectorLayerProviderMapType;
		this.sourceType = OpenLayerOSMVectorLayerProviderSourceType;
	}

	create(metaData: any): any {
		const vectorLayer = new TileLayer({
			source: new OSM({
				attributions: [
					metaData.name,
					metaData.id
				],
				opaque: false,
				url: metaData.url,
				crossOrigin: null
			})
		});

		return { layer: vectorLayer, id: metaData.id };
	}

	createAsync(metaData: any): Observable<any> {
		let layer = this.create(metaData);
		return Observable.of(layer);
	}
}
