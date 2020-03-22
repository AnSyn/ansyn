import { IOverlaysState, OverlayReducer, overlaysAdapter, overlaysInitialState } from './overlays.reducer';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	SelectOverlayAction,
	SetDropsAction,
	SetFilteredOverlaysAction,
	SetSpecialObjectsActionStore,
	SetTimelineStateAction,
	UnSelectOverlayAction
} from '../actions/overlays.actions';
import { cloneDeep } from 'lodash';
import { IOverlaySpecialObject } from '../models/overlay.model';
import { Action } from '@ngrx/store';

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
		const action = new LoadOverlaysAction({});
		let mockOverlayInitialState = cloneDeep(overlaysInitialState);
		mockOverlayInitialState = overlaysAdapter.addOne(<any>{ id: 'tmp', value: 'value' }, mockOverlayInitialState);
		expect(mockOverlayInitialState.ids.length).toBe(1);
		const result = OverlayReducer(mockOverlayInitialState, action);
		expect(result.loading).toBe(true);
		expect(result.ids.length).toBe(0);
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
		let mockOverlayInitialState = cloneDeep(overlaysInitialState);


		const overlays = [o1, o2] as any;

		const action = new LoadOverlaysSuccessAction(overlays);
		const result = OverlayReducer(mockOverlayInitialState, action);

		expect(Array.from(Object.keys(result.entities))[0]).toBe('12');
		expect(result.ids.length).toBe(2);
		expect(result.loading).toBe(false);
		expect(result.loaded).toBe(true);
	});


	it('Set Filters actions, should filter only overlays from "overlays" Map', () => {
		let mockOverlayInitialState = cloneDeep(overlaysInitialState);
		const filteredOverlays = ['1', '2', '3', '4', '5', '6'];
		/*  -> '5' and '6' does not exist on "overlays" */
		const setFilteredOverlaysAction = new SetFilteredOverlaysAction(filteredOverlays);
		const overlays: any = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
		const state = OverlayReducer(overlaysAdapter.addAll(overlays, mockOverlayInitialState), setFilteredOverlaysAction);
		expect(state.filteredOverlays).toEqual(['1', '2', '3', '4']);
	});

	it('Set Special Objects', () => {
		let data: IOverlaySpecialObject[] = [];
		data.push({ id: 'fkdsjl', date: new Date(), shape: 'star' });
		const action = new SetSpecialObjectsActionStore(data);

		const result = OverlayReducer(overlaysInitialState, action);
		expect(result.specialObjects.size).toBe(1);
		expect(result.specialObjects.get('fkdsjl'));
	});

	it('set timeline state action should update the store', () => {
		const data1 = {
			start: new Date(Date.now() - (1000 * 60 * 60 * 24 * 30)),
			end: new Date(Date.now())
		};
		const action: Action = new SetTimelineStateAction({ timeLineRange: data1 });
		const result = OverlayReducer(overlaysInitialState, <any>action);
		expect(result.timeLineRange.start.getTime()).toBe(data1.start.getTime());
		expect(result.timeLineRange.end.getTime()).toBe(data1.end.getTime());
	});

	it('set drops action', () => {
		const newDrops = [{ id: '23', date: new Date() }];
		const action = new SetDropsAction(newDrops);
		const result = OverlayReducer(overlaysInitialState, action);
		expect(result.drops).toEqual(newDrops);
	})
});
