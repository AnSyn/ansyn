import { empty, Observable, of, EMPTY } from 'rxjs';
import { IMAGERY_VIDEO_SOURCE_TYPE } from './imagery-video-provider';
import { OverlaySourceProvider } from '../../overlays/models/overlays-source-providers';
import {
	BaseOverlaySourceProvider,
	IFetchParams,
	IStartAndEndDate
} from '../../overlays/models/base-overlay-source-provider.model';
import { IOverlay, Overlay } from '../../overlays/models/overlay.model';
import { limitArray } from '../../core/utils/i-limited-array';
import { sortByDateDesc } from '../../core/utils/sorting';
import { map } from 'rxjs/operators';

const DATA = {
	'4eeb061d-f8a6-4a0a-86cf-8d97c71a62c6': {
		'sensorType': 'Video',
		'sensorName': 'Video',
		'cloudCoverage': 1,
		'azimuth': 0,
		'projection': 'EPSG:3857',
		'photoAngle': 'verticle',
		'containedInSearchPolygon': 'contained',
		'id': '4eeb061d-f8a6-4a0a-86cf-8d97c71a62c6',
		'footprint': {
			'type': 'MultiPolygon',
			'coordinates': [[[[-121.767, 36.95147947183065], [-121.75064, 37.94095623057468], [-123.00023, 37.947589571993284], [-123.00023, 36.95788109520145], [-121.767, 36.95147947183065]]]]
		},
		'bestResolution': 1,
		'name': 'Video',
		'imageUrl': 'https://www.w3schools.com/html/mov_bbb.mp4',
		'thumbnailUrl': 'https://peach.blender.org/wp-content/uploads/dl_1080p-300x168.jpg',
		'date': new Date('2019-10-17T23:53:06.772Z'),
		'photoTime': '2019-10-17T23:53:06.772Z',
		'sourceType': IMAGERY_VIDEO_SOURCE_TYPE,
		'isGeoRegistered': 'notGeoRegistered'
	}
};

@OverlaySourceProvider({
	sourceType: IMAGERY_VIDEO_SOURCE_TYPE
})
export class ImageryVideoOverlaySourceProvider extends BaseOverlaySourceProvider {
	fetch(fetchParams: IFetchParams): Observable<any> {
		return of(Object.values(DATA).map((o: any) => new Overlay(o) )).pipe(
			map((overlays: any[]) => limitArray(overlays, fetchParams.limit, {
				sortFn: sortByDateDesc,
				uniqueBy: o => o.id
			})),
		);
	}

	getById(id: string, sourceType: string): Observable<IOverlay> {
		return of(DATA[id]);
	}

	getStartDateViaLimitFacets(params: { facets; limit; region }): Observable<IStartAndEndDate> {
		return EMPTY;
	}

	getStartAndEndDateViaRangeFacets(params: { facets; limitBefore; limitAfter; date; region }): Observable<any> {
		return EMPTY;
	}
}
