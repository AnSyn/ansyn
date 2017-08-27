import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayAction, DisplayOverlayFromStoreAction,
	LoadOverlaysAction, LoadOverlaysSuccessAction, OverlaysActionTypes,
	OverlaysMarkupAction, RequestOverlayByIDFromBackendAction, SetTimelineStateAction
} from '../actions/overlays.actions';
import { OverlaysService } from '../services/overlays.service';
import { Store } from '@ngrx/store';
import { IOverlayState } from '../reducers/overlays.reducer';
import { ICasesState } from '../../menu-items/cases/reducers/cases.reducer';
import { Overlay } from '../models/overlay.model';
import { isNil as _isNil, isEqual} from 'lodash';
import 'rxjs/add/operator/share';

@Injectable()
export class OverlaysEffects {

	@Effect()
	onDisplayOverlayFromStore$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE)
		.withLatestFrom(this.store$.select('overlays'), (action: DisplayOverlayFromStoreAction, state: IOverlayState): any => {
			return {overlay: state.overlays.get(action.payload.id), map_id: action.payload.map_id};
		})
		.map( ({overlay, map_id}: any) => {
			return new DisplayOverlayAction({overlay, map_id});
		}).share();

	@Effect({dispatch:false})
	onOverlaysMarkupChanged$: Observable<OverlaysMarkupAction> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.share();

	@Effect({dispatch: false})
	onRedrawTimeline$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.REDRAW_TIMELINE)
		.map(() => true)
		.share();

	@Effect()
	loadOverlays$: Observable<LoadOverlaysSuccessAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.switchMap((action) => {

			// return Observable.of(mockOverlays).map((data:any) => {
			// 	return new LoadOverlaysSuccessAction(data);
			// });
			return this.overlaysService.search(action.payload) //this.overlaysService.fetchData("",action.payload)
				.map(data => {
					return new LoadOverlaysSuccessAction(data);
				});
		});

	@Effect()
	onRequestOverlayByID$: Observable<DisplayOverlayAction> = this.actions$
		.ofType(OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND)
		.flatMap((action: RequestOverlayByIDFromBackendAction) => {
			return this.overlaysService.getOverlayById(action.payload.overlayId) //this.overlaysService.fetchData("",action.payload)
				.map((overlay: Overlay)=> {
					return new DisplayOverlayAction({overlay, map_id: action.payload.map_id});
				});
		});

	@Effect()
	initTimelineStata$: Observable<SetTimelineStateAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.map((action: LoadOverlaysAction) => {
			const from = new Date(action.payload.from);
			const to = new Date(action.payload.to);
			return new SetTimelineStateAction({from, to});
		});

	@Effect()
	goPrevDisplay$: Observable<DisplayOverlayFromStoreAction> = this.actions$
		.ofType(OverlaysActionTypes.GO_PREV_DISPLAY)
		.withLatestFrom((this.store$.select('overlays').pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			const prevOverlayId = filteredOverlays[index - 1];
			return prevOverlayId;
		})
		.filter(prevOverlayId => !_isNil(prevOverlayId))
		.map(prevOverlayId => {
			return new DisplayOverlayFromStoreAction({id: prevOverlayId});
		});

	@Effect()
	goNextDisplay$: Observable<DisplayOverlayFromStoreAction> = this.actions$
		.ofType(OverlaysActionTypes.GO_NEXT_DISPLAY)
		.withLatestFrom((this.store$.select('overlays').pluck('filteredOverlays')), (action, filteredOverlays: string[]): string => {
			const index = filteredOverlays.indexOf(action.payload);
			const nextOverlayId = filteredOverlays[index + 1];
			return nextOverlayId;
		})
		.filter(nextOverlayId => !_isNil(nextOverlayId))
		.map(nextOverlayId => {
			return new DisplayOverlayFromStoreAction({id: nextOverlayId});
		});


	// this method moves the timeline to active displayed overlay if exists in timeline
	@Effect()
	displayOverlaySetTimeline$ = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action: DisplayOverlayAction, overlays: IOverlayState, cases: ICasesState) => {
			const displayedOverlay = overlays.overlays.get(action.payload.overlay.id);
			const timelineState = overlays.timelineState;
			const isActiveMap: boolean =  _isNil(action.payload.map_id) ||  isEqual(cases.selected_case.state.maps.active_map_id, action.payload.map_id);
			return [isActiveMap, displayedOverlay, timelineState];
		})
		.filter(([isActiveMap, displayedOverlay, timelineState]: [boolean, Overlay, any]) => {
			return isActiveMap && displayedOverlay && (displayedOverlay.date < timelineState.from || timelineState.to < displayedOverlay.date);
		})
		.map(([isActiveMap, displayedOverlay, timelineState]:[Overlay, Overlay, any]) => {
			const timeState = this.overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			return new SetTimelineStateAction(timeState);
		})
		.share();

	constructor(private actions$: Actions,
				private store$: Store<IOverlayState>,
				private overlaysService: OverlaysService) {}
}



// export const mockOverlays = [
// 	{
// 		"id": "c6c69206-2032-4922-a29f-9b0639ec2a21",
// 		"footprint": {
// 			"type": "MultiPolygon",
// 			"coordinates": [
// 				[
// 					[
// 						[
// 							-74.04320629,
// 							40.7589524
// 						],
// 						[
// 							-73.80725456,
// 							40.77438832
// 						],
// 						[
// 							-73.80771448,
// 							40.64655227
// 						],
// 						[
// 							-74.04319698,
// 							40.63061886
// 						],
// 						[
// 							-74.04320629,
// 							40.7589524
// 						]
// 					]
// 				]
// 			],
// 			"bbox": [
// 				-74.04320629,
// 				40.63061886,
// 				-73.80725456,
// 				40.77438832
// 			]
// 		},
// 		"sensorType": "WORLDVIEW02",
// 		"sensorName": "Panchromatic",
// 		"channel": 1,
// 		"bestResolution": 0.548,
// 		"name": "103001006B2CC600",
// 		"imageUrl": "http://idaho.geobigdata.io/v1/tile/idaho-images/c6c69206-2032-4922-a29f-9b0639ec2a21/{z}/{x}/{y}?bands=0&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RpZ2l0YWxnbG9iZS1wbGF0Zm9ybS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTk0OTI0MDc1NGU5ZDkzMzVhNDNmMjlkIiwiYXVkIjoidmhhTkVKeW1MNG0xVUNvNFRxWG11S3RrbjlKQ1lEa1QiLCJleHAiOjE1MDE0MTQ4OTAsImlhdCI6MTUwMDgxMDA5MH0.CJkhzccC_WwXYOeC0hceyTSNGoYA6mffhHVOzPCo-YE",
// 		"thumbnailUrl": "https://geobigdata.io/thumbnails/v1/browse/103001006B2CC600.large.png",
// 		"photoTime": "2017-07-09T15:47:29.350Z",
// 		"azimuth": 0,
// 		"sourceType": "IDAHO",
// 		"date": "2017-07-09T15:47:29.350Z"
// 	},
// 	{
// 		"id": "90514ee6-e50e-4c38-98ba-3139a0d30973",
// 		"footprint": {
// 			"type": "MultiPolygon",
// 			"coordinates": [
// 				[
// 					[
// 						[
// 							-74.16973707,
// 							40.80547132
// 						],
// 						[
// 							-73.94161308,
// 							40.78435307
// 						],
// 						[
// 							-73.94267916,
// 							40.65802506
// 						],
// 						[
// 							-74.16875032,
// 							40.67747154
// 						],
// 						[
// 							-74.16973707,
// 							40.80547132
// 						]
// 					]
// 				]
// 			],
// 			"bbox": [
// 				-74.16973707,
// 				40.65802506,
// 				-73.94161308,
// 				40.80547132
// 			]
// 		},
// 		"sensorType": "WORLDVIEW02",
// 		"sensorName": "Panchromatic",
// 		"channel": 1,
// 		"bestResolution": 0.55,
// 		"name": "103001006D999A00",
// 		"imageUrl": "http://idaho.geobigdata.io/v1/tile/idaho-images/90514ee6-e50e-4c38-98ba-3139a0d30973/{z}/{x}/{y}?bands=0&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RpZ2l0YWxnbG9iZS1wbGF0Zm9ybS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTk0OTI0MDc1NGU5ZDkzMzVhNDNmMjlkIiwiYXVkIjoidmhhTkVKeW1MNG0xVUNvNFRxWG11S3RrbjlKQ1lEa1QiLCJleHAiOjE1MDE0MTQ4OTAsImlhdCI6MTUwMDgxMDA5MH0.CJkhzccC_WwXYOeC0hceyTSNGoYA6mffhHVOzPCo-YE",
// 		"thumbnailUrl": "https://geobigdata.io/thumbnails/v1/browse/103001006D999A00.large.png",
// 		"photoTime": "2017-07-09T15:48:34.535Z",
// 		"azimuth": 0,
// 		"sourceType": "IDAHO",
// 		"date": "2017-07-09T15:48:34.535Z"
// 	},
// 	{
// 		"id": "37cd33e7-a179-470b-b412-23a43e03875b",
// 		"footprint": {
// 			"type": "MultiPolygon",
// 			"coordinates": [
// 				[
// 					[
// 						[
// 							-74.13619441,
// 							40.80051536
// 						],
// 						[
// 							-73.92284301,
// 							40.80324726
// 						],
// 						[
// 							-73.92336848,
// 							40.67540762
// 						],
// 						[
// 							-74.1356874,
// 							40.67261731
// 						],
// 						[
// 							-74.13619441,
// 							40.80051536
// 						]
// 					]
// 				]
// 			]
// 		},
// 		"sensorType": "WORLDVIEW02",
// 		"sensorName": "Panchromatic",
// 		"channel": 1,
// 		"bestResolution": 0.538,
// 		"name": "103001006A804F00",
// 		"imageUrl": "http://idaho.geobigdata.io/v1/tile/idaho-images/37cd33e7-a179-470b-b412-23a43e03875b/{z}/{x}/{y}?bands=0&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RpZ2l0YWxnbG9iZS1wbGF0Zm9ybS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTk0OTI0MDc1NGU5ZDkzMzVhNDNmMjlkIiwiYXVkIjoidmhhTkVKeW1MNG0xVUNvNFRxWG11S3RrbjlKQ1lEa1QiLCJleHAiOjE1MDI3OTgyMDksImlhdCI6MTUwMjE5MzQwOX0.ybN3yENaZajHad2GWKFSyPsqFO-I1CO-QU5-_5Lfm94",
// 		"thumbnailUrl": "https://geobigdata.io/thumbnails/v1/browse/103001006A804F00.large.png",
// 		"date": "2017-07-06T15:59:25.576Z",
// 		"photoTime": "2017-07-06T15:59:25.576Z",
// 		"azimuth": 0,
// 		"sourceType": "IDAHO",
// 		"isFullOverlay": true
// 	}
// ]
