import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate } from '@ansyn/overlays';
import {
	ErrorHandlerService,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius, IMapSourceProvidersConfig,
	IOverlay,
	limitArray,
	LoggerService, MAP_SOURCE_PROVIDERS_CONFIG,
	Overlay,
	sortByDateDesc,
	toRadians
} from '@ansyn/core';
import { ITBOverlay, ITBConfig } from './tb.model';
import { Polygon } from 'geojson';

export const TBOverlaySourceType = 'TB';

export interface ITBRequestBody {
	worldName: string;
	geometry: Polygon | any;
	dates: {
		start: string,
		end: string
	};
}

@Injectable()
export class TBSourceProvider extends BaseOverlaySourceProvider {
	readonly sourceType = TBOverlaySourceType;

	get config(): ITBConfig {
		return this.mapSourceProvidersConfig[this.sourceType];
	}

	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {
		let geometry;

		if (fetchParams.region.type === 'Point') {
			geometry = getPolygonByPointAndRadius((<any>fetchParams.region).coordinates).geometry as GeoJSON.Polygon;
		} else {
			geometry = fetchParams.region;
		}

		const body: ITBRequestBody = {
			worldName: 'public',
			dates: {
				start: fetchParams.timeRange.start.toISOString(),
				end: fetchParams.timeRange.end.toISOString()
			},
			geometry
		};

		return this.http.post<any>(this.config.baseUrl, body).pipe(
			map((overlays: Array<ITBOverlay>) => overlays.map((element) => this.parseData(element))),
			map((overlays: IOverlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
			catchError((error: Response | any) => {
				return this.errorHandlerService.httpErrorHandle(error);
			})
		);


	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		return this.http.get<ITBOverlay>(`${this.config.baseUrl}/${id}`).pipe(
			map((tbLayer) => this.parseData(tbLayer))
		);
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		return EMPTY;
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return EMPTY;
	}

	protected parseData(tbOverlay: ITBOverlay): IOverlay {
		return new Overlay({
			id: tbOverlay._id,
			name: tbOverlay.inputData.ansyn.title,
			footprint: geojsonPolygonToMultiPolygon(tbOverlay.geoData.footprint.geometry),
			sensorType: tbOverlay.inputData.sensor.type,
			sensorName: tbOverlay.inputData.sensor.name,
			bestResolution: 1,
			imageUrl: tbOverlay.imageUrl,
			thumbnailUrl: tbOverlay.imageUrl,
			date: new Date(tbOverlay.fileData.lastModified),
			photoTime: new Date(tbOverlay.fileData.lastModified).toISOString(),
			azimuth: toRadians(180),
			sourceType: this.sourceType,
			isGeoRegistered: true,
			tag: tbOverlay
		});
	}
}
