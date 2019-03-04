import { Inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate, OverlaySourceProvider } from '@ansyn/overlays';
import {
	ErrorHandlerService,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
	IMapSourceProvidersConfig,
	IMultipleOverlaysSourceConfig,
	IOverlay,
	limitArray,
	LoggerService,
	MAP_SOURCE_PROVIDERS_CONFIG,
	MultipleOverlaysSourceConfig,
	Overlay,
	sortByDateDesc
} from '@ansyn/core';
import { ITBConfig, ITBOverlay } from './tb.model';
import { Polygon } from 'geojson';

export const TBOverlaySourceType = 'TB';

export interface ITBQuery {
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
	queries: ITBQuery[];
}

@OverlaySourceProvider({
	sourceType: TBOverlaySourceType
})
export class TBSourceProvider extends BaseOverlaySourceProvider {
	get config(): ITBConfig {
		return this.mapSourceProvidersConfig[this.sourceType];
	}

	baseUrl = `${this.config.baseUrl}/layers`;

	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		@Inject(MultipleOverlaysSourceConfig) protected multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig) {
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

		// set the queries according to the Sensor Type and Name
		if (Array.isArray(fetchParams.dataInputFilters) && fetchParams.dataInputFilters.length > 0) {
			const query = {
				field: 'inputData.sensor.type',
				values: [],
				isMatch: true
			};

			// set Sensor Types in the filter query
			if (fetchParams.dataInputFilters[0].sensorType) {
				const sensorTypesInput = fetchParams.dataInputFilters.map(filter => filter.sensorType);
				if (sensorTypesInput.some(sensorType => sensorType === 'others')) {
					const sensorTypesList = this.multipleOverlaysSourceConfig[this.sourceType].dataInputFiltersConfig.children.map(({ value }) => value.sensorType);
					query.values = sensorTypesList.filter(sensor => !sensorTypesInput.includes(sensor));
					query.isMatch = false;
				} else {
					query.values = sensorTypesInput;
					query.isMatch = true;
				}
				queries.push(query);
			}
		}

		const body: ITBRequestBody = {
			worldName: 'public',
			geometry,
			dates: {
				start: fetchParams.timeRange.start.toISOString(),
				end: fetchParams.timeRange.end.toISOString()
			},
			queries
		};

		return this.http.post<any>(this.baseUrl, body).pipe(
			map((overlays: Array<ITBOverlay>) => overlays
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
		return this.http.get<ITBOverlay>(`${this.baseUrl}/${id}`).pipe(
			map((tbLayer) => this.parseData(tbLayer))
		);
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		return EMPTY;
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return EMPTY;
	}

	public parseData(tbOverlay: ITBOverlay): IOverlay {
		if (tbOverlay.overlay) {
			return new Overlay(({
				...tbOverlay.overlay,
				footprint: geojsonPolygonToMultiPolygon(tbOverlay.overlay.footprint),
				date: new Date(tbOverlay.overlay.date),
				sourceType: this.sourceType,
				thumbnailUrl: `${tbOverlay.overlay.thumbnailUrl}${tbOverlay.overlay.sensorName === 'venus' ? '&styles=venus' : ''}`,
			}));
		}
		return new Overlay({
			id: tbOverlay._id,
			name: tbOverlay.name,
			footprint: geojsonPolygonToMultiPolygon(tbOverlay.geoData.footprint.geometry),
			sensorType: tbOverlay.inputData.sensor.type,
			sensorName: tbOverlay.inputData.sensor.name,
			cloudCoverage: tbOverlay.inputData.cloudCoveragePercentage / 100,
			bestResolution: 1,
			imageUrl: tbOverlay.displayUrl,
			thumbnailUrl: tbOverlay.thumbnailUrl,
			date: new Date(tbOverlay.createdDate),
			photoTime: new Date(tbOverlay.createdDate).toISOString(),
			azimuth: 0,
			sourceType: this.sourceType,
			isGeoRegistered: tbOverlay.geoData.isGeoRegistered,
			tag: tbOverlay,
			creditName: tbOverlay.inputData.ansyn.creditName
		});
	}
}
