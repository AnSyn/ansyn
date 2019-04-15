import { OpenLayersMapSourceProvider } from '../../@ansyn/ansyn/modules/plugins/openlayers/mapSourceProviders/open-layers.map-source-provider';
import { OpenLayersDisabledMap } from '../../@ansyn/ansyn/modules/plugins/openlayers/maps/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '../../@ansyn/ansyn/modules/plugins/openlayers/maps/open-layers-map/openlayers-map/openlayers-map';
import {
	CacheService,
	ICaseMapState,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from "@ansyn/imagery";
import TileLayer from 'ol/layer/Tile';
import { GML } from 'ol/format';
import * as wellknown from 'wellknown';
import * as turf from '@turf/turf';
import * as proj from 'ol/proj';
import TileWMS from 'ol/source/TileWMS';

import { Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSentinelselectedLayers } from "./reducers/sentinel.reducer";
import { map, take } from 'rxjs/operators';

export const OpenLayerSentinelSourceProviderSourceType = 'SENTINEL';

@ImageryMapSource({
	sourceType: OpenLayerSentinelSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayersSentinelSourceProvider extends OpenLayersMapSourceProvider {
	layer: string;

	constructor(protected store: Store<any>,
				protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig)
	}

	public create(metaData: ICaseMapState): any {
		const projection = 'EPSG:3857';
		const footprint = { ...metaData.data.overlay.footprint };
		footprint.coordinates = [[footprint.coordinates[0][0].map(coordinate => proj.transform(coordinate, 'EPSG:4326', projection))]];
		const baseUrl = metaData.data.overlay.imageUrl;
		const geometry = wellknown.stringify(footprint);
		const bbox = turf.bbox(turf.feature(footprint));
		const { date } = metaData.data.overlay;
		const source = new TileWMS({
			url: baseUrl,
			params: {
				LAYERS: this.layer,
				GEOMETRY: geometry,
				TIME: this.createDateString(date),
				MAXCC: 100
			},
		});
		const layer = new TileLayer({
			projection,
			source: source,
			extent: bbox

		});
		return Promise.resolve([layer]);
	}

	createOrGetFromCache(metaData: ICaseMapState): any {
		const cacheId = `${this.generateLayerId(metaData)}${this.layer}`;
		const cacheLayers = this.cacheService.getLayerFromCache(cacheId);
		if (cacheLayers.length) {
			return Promise.resolve(cacheLayers);
		}

		return this.create(metaData).then((layers) => {
			this.cacheService.addLayerToCache(cacheId, layers);
			return layers;
		});
	}


	createAsync(metaData: ICaseMapState): Promise<any> {
		return this.store.select(selectSentinelselectedLayers).pipe(
			take(1),
			map(sentinelLayer => {
				this.layer = sentinelLayer[metaData.id] ? sentinelLayer[metaData.id] : sentinelLayer.defaultLayer;
				return this.createOrGetFromCache(metaData).then((layers) => {
					return this.addFootprintToLayerPromise(Promise.resolve(layers[0]), metaData);
				});
			})).toPromise()

	}

	getThumbnailName(overlay): string {
		const superName = super.getThumbnailName(overlay);
		return superName.length > 20 ? `...${superName.substring(0, 15)}` : superName;
	}

	createDateString(date: Date): string {
		const Y = date.getFullYear();
		const m = date.getMonth() + 1;
		const d = date.getDate();
		const str = `${Y}-${m >= 10 ? m : `0${m}`}-${d >= 10 ? d : `0${d}`}`
		return `${str}`
	}
}
