import {
	CacheService,
	EPSG_3857,
	EPSG_4326,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import * as wellknown from 'wellknown';
import * as turf from '@turf/turf';
import * as proj from 'ol/proj';
import TileWMS from 'ol/source/TileWMS';

import { Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSentinelselectedLayers } from './reducers/sentinel.reducer';
import { map, take } from 'rxjs/operators';
import { OpenLayersDisabledMap, OpenLayersMap, OpenLayersMapSourceProvider } from '@ansyn/ol';
import { BBox2d } from '@turf/helpers/lib/geojson';

export const OpenLayerSentinelSourceProviderSourceType = 'SENTINEL';

@ImageryMapSource({
	sourceType: OpenLayerSentinelSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayersSentinelSourceProvider extends OpenLayersMapSourceProvider {
	layer: string;
	geometry: any;

	constructor(protected store: Store<any>,
				protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	createExtent(metaData: IMapSettings, destinationProjCode: string = EPSG_3857): [number, number, number, number] {
		const footprint = { ...metaData.data.overlay.footprint };
		footprint.coordinates = [[footprint.coordinates[0][0].map(coordinate => proj.transform(coordinate, EPSG_4326, destinationProjCode))]];
		this.geometry = wellknown.stringify(footprint);
		return <BBox2d>turf.bbox(turf.feature(footprint));
	}

	createSource(metaData: IMapSettings): any {
		const baseUrl = metaData.data.overlay.imageUrl;
		const { date } = metaData.data.overlay;
		const source = new TileWMS({
			crossOrigin: 'Anonymous',
			url: baseUrl,
			params: {
				LAYERS: this.layer,
				GEOMETRY: this.geometry,
				TIME: this.createDateString(date),
				MAXCC: 100
			}
		});
		return source;
	}

	public create(metaData: IMapSettings): any {
		return this.store.select(selectSentinelselectedLayers).pipe(
			take(1),
			map(sentinelLayer => {
				this.layer = sentinelLayer[metaData.id] ? sentinelLayer[metaData.id] : sentinelLayer.defaultLayer;
				return super.create(metaData);
			})).toPromise();
	}

	generateLayerId(metaData: IMapSettings) {
		return `${ super.generateLayerId(metaData) }/${ this.layer }`;
	}

	createDateString(date: Date): string {
		const Y = date.getFullYear();
		const m = date.getMonth() + 1;
		const d = date.getDate();
		const str = `${ Y }-${ m >= 10 ? m : `0${ m }` }-${ d >= 10 ? d : `0${ d }` }`;
		return `${ str }`;
	}
}
