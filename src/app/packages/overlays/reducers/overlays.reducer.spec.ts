import { IOverlaysState, OverlayReducer, overlaysInitialState } from './overlays.reducer';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	SelectOverlayAction,
	SetFilteredOverlaysAction,
	SetSpecialObjectsActionStore,
	SetTimelineStateAction,
	UnSelectOverlayAction
} from '../actions/overlays.actions';
import { cloneDeep } from 'lodash';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';

describe('Overlay Reducer', () => {
	let o1, o2, o3, o4;
	beforeEach(() => {
		o1 = {
			id: '12',
			name: 'tmp12',
			date: new Date(2017, 7, 30),
			photoTime: new Date(2017, 7, 30).toISOString(),
			azimuth: 10
		};

		o2 = {
			id: '13',
			name: 'tmp13',
			date: new Date(2017, 6, 30),
			photoTime: new Date(2017, 6, 30).toISOString(),
			azimuth: 10
		};

		o3 = {
			id: '14',
			name: 'tmp14',
			date: new Date(2017, 7, 30),
			photoTime: new Date(2017, 7, 30).toISOString(),
			azimuth: 12
		};

		o4 = {
			id: '15',
			name: 'tmp15',
			date: new Date(2017, 7, 30),
			photoTime: new Date(2017, 7, 30).toISOString(),
			azimuth: 104
		};
	});

	it('should activate loadOverlay reducer', () => {

		const queryParams = { search: '9399ejf' };
		const action = new LoadOverlaysAction(queryParams);
		const mockOverlayInitialState = cloneDeep(overlaysInitialState);

		mockOverlayInitialState.overlays.set('tmp', <any> 'value');
		expect(mockOverlayInitialState.overlays.size).toBe(1);
		const result = OverlayReducer(mockOverlayInitialState, action);

		expect(result.loading).toBe(true);
		expect(result.overlays.size).toBe(0);
		expect(result.queryParams).toEqual(queryParams);
	});


	it('should add overlay id to selected overlays array\'s', () => {
		const fakeId = 'iu34-2322';
		const action = new SelectOverlayAction(fakeId);

		const result: IOverlaysState = OverlayReducer(overlaysInitialState, action);
		expect(result.selectedOverlays.includes(fakeId)).toBeTruthy();

	});

	it('should remove overlay id from the selected overlays array\'s', () => {
		const fakeId = 'iu34-2322';
		const action = new SelectOverlayAction(fakeId);

		let result: IOverlaysState = OverlayReducer(overlaysInitialState, action);

		expect(result.selectedOverlays.includes(fakeId)).toBeTruthy();


		const unSelectAction = new UnSelectOverlayAction(fakeId);

		result = OverlayReducer(result, unSelectAction);

		expect(result.selectedOverlays.length).toBe(0);
	});


	it('should load all overlays', () => {
		overlaysInitialState.overlays = new Map();


		const overlays = [o1, o2] as any;

		const action = new LoadOverlaysSuccessAction(overlays);
		const result = OverlayReducer(overlaysInitialState, action);

		expect(Array.from(result.overlays.keys())[0]).toBe('13');
		expect(result.overlays.size).toBe(2);
		expect(result.loading).toBe(false);
		expect(result.loaded).toBe(true);
	});


	it('Set Filters actions', () => {


		const action = new LoadOverlaysSuccessAction([o1, o2, o3, o4] as any);
		const result = OverlayReducer(overlaysInitialState, action);

		const actionTestA = new SetFilteredOverlaysAction({
			showOnlyFavorites: false,
			favorites: ['15'],
			parsedFilters: {}

		});
		const resultTestA = OverlayReducer(result, actionTestA);
		expect(resultTestA.filteredOverlays.length).toBe(4);

		const actionTestB = new SetFilteredOverlaysAction({
			showOnlyFavorites: true,
			favorites: ['15'],
			parsedFilters: {}

		});
		const resultTestB = OverlayReducer(result, actionTestB);
		expect(resultTestB.filteredOverlays.length).toBe(1);

		const actionTestC = new SetFilteredOverlaysAction({
			showOnlyFavorites: true,
			favorites: [],
			parsedFilters: {}

		});
		const resultTestC = OverlayReducer(result, actionTestC);
		expect(resultTestC.filteredOverlays.length).toBe(0);

	});

	it('Set Special Objects', () => {
		let data: OverlaySpecialObject[] = [];
		data.push({ id: 'fkdsjl', date: new Date(), shape: 'star' });
		const action = new SetSpecialObjectsActionStore(data);

		const result = OverlayReducer(overlaysInitialState, action);
		expect(result.specialObjects.size).toBe(1);
		expect(result.specialObjects.get('fkdsjl'));
	});

	it('set timeline state action should update the store', () => {
		const data1 = { to: new Date(), from: new Date((new Date()).getTime() - (1000 * 60 * 60 * 24 * 30)) };

		const action = new SetTimelineStateAction({ state: data1 });
		const result = OverlayReducer(overlaysInitialState, action);
		expect(result.timelineState.from.getTime()).toBe(data1.from.getTime());
		expect(result.timelineState.to.getTime()).toBe(data1.to.getTime());
	});

	it('set timeline state action should fail and not update the store', () => {
		const data1 = { from: new Date(), to: new Date((new Date()).getTime() - (1000 * 60 * 60 * 24 * 30)) };

		const action = new SetTimelineStateAction({ state: data1 });
		const result = OverlayReducer(overlaysInitialState, action);
		expect(result.timelineState.from.getTime()).not.toBe(data1.from.getTime());
		expect(result.timelineState.to.getTime()).not.toBe(data1.to.getTime());
	});

});
