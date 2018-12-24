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
	IOverlay,
	limitArray,
	LoggerService,
	MAP_SOURCE_PROVIDERS_CONFIG,
	Overlay,
	sortByDateDesc
} from '@ansyn/core';
import { ITBConfig, ITBOverlay } from './tb.model';
import { Polygon } from 'geojson';
import { IStatusBarConfig, StatusBarConfig } from "@ansyn/status-bar";

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

	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		@Inject(StatusBarConfig) protected statusBarConfig: IStatusBarConfig) {
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
				const sensorTypesInput = fetchParams.dataInputFilters.map(filter => filter.sensorType.trim().toLowerCase());
				if (sensorTypesInput.some(sensorType => sensorType === 'others')) {
					const sensorTypesList = this.statusBarConfig.dataInputFiltersConfig[this.sourceType].treeViewItem.children.map(({ value }) => value.sensorType.trim().toLowerCase());
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

		return this.http.post<any>(this.config.baseUrl, body).pipe(
			map((overlays: Array<ITBOverlay>) => overlays
				.filter((o: ITBOverlay) => o.fileType === 'image' || o.fileType === 'raster')
				.map((element) => {
					const parseData = this.parseData(element);
					console.log(`TBSourceProvider parseData: ${JSON.stringify(parseData)}`);
					return parseData;
				})
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
		console.log('start parseData...');
		console.log(`tbOverlay thumbnailUrl: ${JSON.stringify(tbOverlay.thumbnailUrl)}`);
		console.log(`tbOverlay isGeoRegistered: ${JSON.stringify(tbOverlay.geoData.isGeoRegistered)}`);

		return new Overlay({
			id: tbOverlay._id,
			name: tbOverlay.name,
			footprint: geojsonPolygonToMultiPolygon(tbOverlay.geoData.footprint.geometry),
			sensorType: tbOverlay.inputData.sensor.type,
			sensorName: tbOverlay.inputData.sensor.name,
			bestResolution: 1,
			imageUrl: tbOverlay.displayUrl,
			thumbnailUrl: tbOverlay.thumbnailUrl,
			date: new Date(tbOverlay.createdDate),
			photoTime: new Date(tbOverlay.createdDate).toISOString(),
			azimuth: 0,
			sourceType: this.sourceType,
			isGeoRegistered: tbOverlay.geoData.isGeoRegistered,
			tag: tbOverlay
		});
	}
}
