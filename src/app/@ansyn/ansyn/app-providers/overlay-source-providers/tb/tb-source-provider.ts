import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate } from '@ansyn/overlays';
import {
	ErrorHandlerService,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
	IMapSourceProvidersConfig,
	IOverlay,
	limitArray,
	LoggerService,
	MAP_SOURCE_PROVIDERS_CONFIG,
	Overlay,
	sortByDateDesc,
	toRadians
} from '@ansyn/core';
import { ITBConfig, ITBOverlay } from './tb.model';
import { Polygon } from 'geojson';

export const TBOverlaySourceType = 'TB';

export interface IQuery {
	field: string;
	values: string[];
	isMatch: boolean;
}

export interface ITBRequestBody {
	worldName: string;
	geometry: Polygon | any;
	dates: {
		start: string,
		end: string
	};
	queries: IQuery[];
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
		let queries = [];

		if (fetchParams.region.type === 'Point') {
			geometry = getPolygonByPointAndRadius((<any>fetchParams.region).coordinates).geometry as GeoJSON.Polygon;
		} else {
			geometry = fetchParams.region;
		}

		if (fetchParams.dataInputFilters.length !== 0) {
			let sensorTypeMatch = true;
			let sensorNameMatch = true;
			let sensorTypes;
			let sensorNames;

			if (fetchParams.dataInputFilters[0].sensorType) {
				sensorTypes = fetchParams.dataInputFilters.map(filter => filter.sensorType);
				if (sensorTypes.find(sensorType => sensorType === 'others')) {
					sensorTypeMatch = false;
					sensorTypes = sensorTypes.filter(sensorType => !(sensorType === 'others'));
				}
			} else {
				sensorTypes = [];
			}

			if (fetchParams.dataInputFilters[0].sensorName) {
				sensorNames = fetchParams.dataInputFilters.map(filter => filter.sensorName);
				if (sensorNames.find(sensorName => sensorName === 'others')) {
					sensorNameMatch = false;
					sensorNames = sensorNames.filter(sensorName => !(sensorName === 'others'));
				}
			} else {
				sensorNames = [];
			}

			if (sensorTypes.length !== 0) {
				queries.push({
					field: 'inputData.sensor.type',
					values: sensorTypes,
					isMatch: sensorTypeMatch
				})
			}

			if (sensorNames.length !== 0) {
				queries.push({
					field: 'inputData.sensor.name',
					values: sensorNames,
					isMatch: sensorNameMatch
				})
			}
		}

		console.log(`TB fetch body queries: ${JSON.stringify(queries)}`);

		const body: ITBRequestBody = {
			worldName: fetchParams.worldName || 'public',
			geometry,
			dates: {
				start: fetchParams.timeRange.start.toISOString(),
				end: fetchParams.timeRange.end.toISOString()
			},
			queries
		};

		return this.http.post<any>(this.config.baseUrl, body).pipe(
			map((overlays: Array<ITBOverlay>) => overlays
				.filter((o: ITBOverlay) => o.fileType === 'image')
				.map((element) => this.parseData(element))
			),
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
			thumbnailUrl: tbOverlay.imageData.thumbnailUrl,
			footprint: geojsonPolygonToMultiPolygon(tbOverlay.geoData.footprint.geometry),
			sensorType: tbOverlay.inputData.sensor.type,
			sensorName: tbOverlay.inputData.sensor.name,
			bestResolution: 1,
			imageUrl: tbOverlay.displayUrl,
			date: new Date(tbOverlay.createdDate),
			photoTime: new Date(tbOverlay.createdDate).toISOString(),
			azimuth: toRadians(180),
			sourceType: this.sourceType,
			isGeoRegistered: false,
			tag: tbOverlay
		});
	}
}
