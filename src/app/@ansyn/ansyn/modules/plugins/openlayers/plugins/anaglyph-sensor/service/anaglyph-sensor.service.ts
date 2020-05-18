import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GeoRegisteration, IOverlay } from '../../../../../overlays/models/overlay.model';
import {
	BaseImageryLayer,
	BaseMapSourceProvider, CommunicatorEntity, ImageryCommunicatorService, IMapSettings
} from '@ansyn/imagery';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { DisabledOpenLayersMapName, OpenlayersMapName, OpenLayersStaticImageSourceProviderSourceType } from '@ansyn/ol';
import { cloneDeep } from 'lodash';
import { fromPromise } from 'rxjs/internal-compatibility';
import { CesiumMapName } from '@ansyn/imagery-cesium';
import { AnaglyphConfig, IAnaglyphConfig } from '../models/anaglyph.model';

@Injectable()
export class AnaglyphSensorService {

	isSupprotedOverlay(overlay: IOverlay): Observable<boolean> {
		const result = Array.isArray(this.config.sensorNames) && this.config.sensorNames.includes(overlay.sensorName);
		return of(result);
	}

	displayAnaglyph(mapSettings: IMapSettings): Observable<{} | boolean> {
		const communicator = this.communicatorService.provide(mapSettings.id);
		const sourceLoader: BaseMapSourceProvider = communicator.getMapSourceProvider({
			sourceType: OpenLayersStaticImageSourceProviderSourceType,
			mapType: communicator.ActiveMap.mapType
		});

		const clonedMapSettings = cloneDeep(mapSettings);
		clonedMapSettings.data.overlay.id = `anaglyph_${ mapSettings.data.overlay.id }`;
		clonedMapSettings.data.overlay.tag.imageData = { imageHeight: 649, imageWidth: 1024 };
		clonedMapSettings.data.overlay.imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdZzZE3mBeVAS2MQU_HcQtemn7LLCEU7jSyCekDIbr51XCUdS4';
		clonedMapSettings.data.overlay.isGeoRegistered = GeoRegisteration.notGeoRegistered;

		return this.innerChangeImage(sourceLoader, clonedMapSettings.data.overlay, communicator, clonedMapSettings);
	}

	displayOriginalOverlay(mapSettings: IMapSettings): Observable<{} | boolean> {
		const communicator = this.communicatorService.provide(mapSettings.id);
		const sourceLoader: BaseMapSourceProvider = communicator.getMapSourceProvider({
			sourceType: OpenLayersStaticImageSourceProviderSourceType,
			mapType: communicator.ActiveMap.mapType
		});

		return this.innerChangeImage(sourceLoader, mapSettings.data.overlay, communicator, mapSettings);
	}

	innerChangeImage(sourceLoader: BaseMapSourceProvider, overlay: IOverlay, communicator: CommunicatorEntity, mapSettings: IMapSettings): Observable<{} | boolean> {
		const getLayerObservable = fromPromise(sourceLoader.createAsync(mapSettings));

		const changeActiveMap = mergeMap((layer: BaseImageryLayer) => {
			let observable: Observable<any> = of(true);
			const moveToGeoRegisteredMap = overlay.isGeoRegistered !== GeoRegisteration.notGeoRegistered && communicator.activeMapName === DisabledOpenLayersMapName;
			const moveToNotGeoRegisteredMap = overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered && (communicator.activeMapName === OpenlayersMapName || communicator.activeMapName === CesiumMapName);
			const newActiveMapName = moveToGeoRegisteredMap ? OpenlayersMapName : moveToNotGeoRegisteredMap ? DisabledOpenLayersMapName : '';

			if (newActiveMapName) {
				observable = fromPromise(communicator.setActiveMap(newActiveMapName, mapSettings.data.position, undefined, layer));
			}
			return observable.pipe(map(() => layer));
		});

		const resetView = mergeMap((layer: BaseImageryLayer) => {
			if (Boolean(layer)) {
				return communicator.resetView(layer, mapSettings.data.position, null, true);
			}
			return of(false);
		});

		return getLayerObservable.pipe(
			changeActiveMap,
			resetView,
			catchError((error) => {
				return of(false);
			}));
	}

	constructor(protected communicatorService: ImageryCommunicatorService,
				@Inject(AnaglyphConfig) public config: IAnaglyphConfig) {

	}
}
