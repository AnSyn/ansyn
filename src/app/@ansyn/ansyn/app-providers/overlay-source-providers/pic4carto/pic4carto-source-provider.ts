import { Inject } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, timeout, map } from 'rxjs/operators';
import { getPolygonByPointAndRadius } from '@ansyn/imagery';
import { Point } from 'geojson';
import { OverlaySourceProvider } from '../../../modules/overlays/models/overlays-source-providers';
import {
	BaseOverlaySourceProvider,
	IFetchParams,
	IStartAndEndDate
} from '../../../modules/overlays/models/base-overlay-source-provider.model';
import { ErrorHandlerService } from '../../../modules/core/services/error-handler.service';
import { LoggerService } from '../../../modules/core/services/logger.service';
import { bbox } from '@turf/turf';
import { IOverlay, Overlay, GeoRegisteration } from '../../../modules/overlays/models/overlay.model';
import { limitArray } from '../../../modules/core/utils/i-limited-array';
import { sortByDateDesc } from '../../../modules/core/utils/sorting';
import { IOverlayByIdMetaData } from '../../../modules/overlays/services/overlays.service';
import { forkJoinSafe } from '../../../modules/core/utils/rxjs/observables/fork-join-safe';
import { IPic4CartoConfig, IPic4CartoParams, IPic4CartoPicture, Pic4CartoSourceType } from './pic4carto.model';

export const pic4cartoOverlaySourceConfig = 'pic4cartoOverlaySourceConfig';
@OverlaySourceProvider({
	sourceType: Pic4CartoSourceType
})
export class Pic4cartoSourceProvider extends BaseOverlaySourceProvider {

	constructor(
		public errorHandlerService: ErrorHandlerService,
		protected loggerService: LoggerService,
		protected http: HttpClient,
		@Inject(pic4cartoOverlaySourceConfig) protected config: IPic4CartoConfig) {
		super(loggerService);
	}

	fetch(fetchParams: IFetchParams): Observable<any> {
		let geometry;
		let params: IPic4CartoParams;

		if (fetchParams.region.type === 'Point') {
			geometry = getPolygonByPointAndRadius((<any>fetchParams.region).coordinates).geometry as GeoJSON.Polygon;
		} else {
			geometry = fetchParams.region;
		}
		const geometryBbox = bbox(geometry);
		let ignore = '';

		params = {
			west: `${geometryBbox[0]}`,		// minX
			north: `${geometryBbox[3]}`,	// maxY
			east: `${geometryBbox[2]}`,		// maxX
			south: `${geometryBbox[1]}`,	// minY
			mindate: `${fetchParams.timeRange.start.getTime()}`,
			maxdate: `${fetchParams.timeRange.end.getTime()}`
		};

		return this.fetchRequest(params, fetchParams);
	}

	fetchRequest(params: IPic4CartoParams, fetchParams?: IFetchParams): Observable<any> {
		const timeLimit = this.config.timeLimit;
		return this.http.get(this.config.baseUrl, { params }).pipe(
			map(({ status, pictures }: { status: string, pictures: IPic4CartoPicture[] }) => {
				if (status === 'OK') {
					return pictures.map(this.parseData.bind(this));
				}
				return [];
			}),
			timeout(timeLimit),
			catchError(error => {
				const toastMessage = `Street Open Images Request timed out after ${timeLimit / 1000} sec`;
				return of(this.errorHandlerService.httpErrorHandle(error, toastMessage, []));
			}),
			map((overlays: IOverlay[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			}))
		);
	}

	getByIds(ids: IOverlayByIdMetaData[]): Observable<IOverlay[]> {
		const requests = ids.map((overlay) => this.getById(overlay));
		return forkJoinSafe(requests);
	};

	getById(overlay): Observable<IOverlay> {
		return of(overlay);
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		return EMPTY;
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return EMPTY;
	}

	getThumbnailName(overlay): string {
		return overlay.sensorType;
	}

	getPictureNameAndId(provider: string, url: string): { id: string, name: string } {
		const splitUrl = url.split('/');
		let id;
		let name;

		if (provider.toLowerCase() === 'mapillary') {
			id = splitUrl[splitUrl.length - 2];
			name = `${id}_${splitUrl[splitUrl.length - 1]}`;
		} else {
			name = splitUrl[splitUrl.length - 1];
			id = name.split('.')[0];
		}

		return {
			id,
			name
		};
	}

	public parseData(picture: IPic4CartoPicture): IOverlay {
		const footprint: Point = {
			type: 'Point',
			coordinates: [picture.coordinates.lng, picture.coordinates.lat]
		};
		const date = new Date(+picture.date);
		const nameObject = this.getPictureNameAndId(picture.provider, picture.pictureUrl);

		return new Overlay({
			id: nameObject.id,
			footprint,
			sensorType: picture.provider,
			creditName: picture.author,
			bestResolution: 1,
			cloudCoverage: 1,
			name: nameObject.name,
			imageUrl: picture.pictureUrl,
			thumbnailUrl: picture.pictureUrl,
			date,
			photoTime: date.toISOString(),
			azimuth: 0,
			sourceType: this.sourceType,
			isGeoRegistered: GeoRegisteration.notGeoRegistered,
			tag: {
				metadata: picture,
				download: picture.pictureUrl
			}
		});
	}
}
