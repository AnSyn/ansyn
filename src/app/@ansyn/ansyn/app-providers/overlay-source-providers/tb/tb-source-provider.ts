import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs/index';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/internal/operators';
import { BaseOverlaySourceProvider, IFetchParams, IStartAndEndDate } from '@ansyn/overlays';
import {
	ErrorHandlerService,
	geojsonPolygonToMultiPolygon,
	getPolygonByPointAndRadius,
	IOverlay,
	limitArray,
	LoggerService,
	Overlay,
	sortByDateDesc,
	toRadians
} from '@ansyn/core';
import { ITBOverlay, ITBOverlaySourceConfig, TBOverlaySourceConfig } from './tb.model';
import { Polygon } from 'geojson';

export const TBOverlaySourceType = 'TB';

const DEFAULT_OVERLAYS_LIMIT = 500;

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

	sourceType = TBOverlaySourceType;


	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		@Inject(TBOverlaySourceConfig) protected config: ITBOverlaySourceConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {
		console.log('fetching  tb');
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
			map(data => this.extractData(data)),
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
		// return this.http.get<any>(`${this.config.baseUrl}/${id}`).pipe(tap(() => {
		//
		// })
		return EMPTY;
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		return EMPTY;
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return EMPTY;
	}

	private extractData(overlays: Array<ITBOverlay>): IOverlay[] {
		if (!overlays) {
			return [];
		}
		if (!Array.isArray(overlays)) {
			overlays = [overlays];
		}
		return overlays.map((element) => this.parseData(element));
	}

	protected parseData(tbOverlay: ITBOverlay): IOverlay {
		return new Overlay({
			id: tbOverlay._id,
			name: tbOverlay.name,
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
