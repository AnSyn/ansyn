import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { IMultipleOverlaysSourceConfig, MultipleOverlaysSourceConfig } from '@ansyn/ansyn';
import { IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/imagery';
import { Store } from '@ngrx/store';
import { WMSCapabilities } from 'ol/format';
import { map } from 'rxjs/operators';
import { SetSentinelLayers } from '../actions/sentinel.actions';
import { ISentinelOverlaySourceConfig, SentinelOverlaySourceType } from '../sentinel-source-provider';
import { get as _get } from 'lodash';

@Injectable({
	providedIn: 'root'
})
export class SentinelLayersService {
	get config(): ISentinelOverlaySourceConfig {
		return this.mapSourceProvidersConfig[SentinelOverlaySourceType];
	}

	constructor(protected http: HttpClient,
				protected store: Store<any>,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
				@Inject(MultipleOverlaysSourceConfig) protected multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig) {
		if (!this.multipleOverlaysSourceConfig.indexProviders[SentinelOverlaySourceType].inActive) {
			this.getAllLayers().pipe(
				map(layers => {
					const sentinelLayers = layers.map(layer => ({ name: layer.Name, title: layer.Title }));
					const true_color_index = sentinelLayers.findIndex((elem) => elem.name === 'TRUE_COLOR');
					const tmp = sentinelLayers[0];
					sentinelLayers[0] = sentinelLayers[true_color_index];
					sentinelLayers[true_color_index] = tmp;
					this.store.dispatch(SetSentinelLayers(sentinelLayers));
				})
			).subscribe();
		}
	}

	getAllLayers() {
		let parser = new WMSCapabilities();
		return this.http.get(`${ this.config.baseUrl }/wms?service=WMS&version=1.1.1&request=GetCapabilities`, { responseType: 'text' }).pipe(
			map(xml => parser.read(xml)),
			map((capabilities: any) => _get(capabilities, 'Capability.Layer.Layer') || [])
		);
	}
}
