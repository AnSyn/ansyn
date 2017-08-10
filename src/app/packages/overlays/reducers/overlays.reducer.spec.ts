import { OverlayReducer, overlayInitialState, IOverlayState } from './overlays.reducer';
import {
	UnSelectOverlayAction,
	SelectOverlayAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction
} from '../actions/overlays.actions';
import { Overlay } from '../models/overlay.model';
import { cloneDeep } from 'lodash';

describe('Overlay Reducer', () => {

	describe("Load Overlays", () => {
		it("should activate load_overlay reducer", () => {
			const queryParams = {search: '9399ejf'};
			const action = new LoadOverlaysAction(queryParams);
			const mockOverlayInitialState = cloneDeep(overlayInitialState);
			mockOverlayInitialState.overlays.set('tmp', 'value');
			expect(mockOverlayInitialState.overlays.size).toBe(1);
			const result = OverlayReducer(mockOverlayInitialState, action);
			expect(result.loading).toBe(true);
			expect(result.overlays.size).toBe(0);
			expect(result.queryParams).toEqual(queryParams);
		});
	});

	describe("Selected Overlay", () => {
		it('should add overaly id to seleced overlays array\'s', () => {
			const fakeId = 'iu34-2322';
			const action = new SelectOverlayAction(fakeId);

			const result: IOverlayState = OverlayReducer(overlayInitialState, action);
			expect(result.selectedOverlays.indexOf(fakeId)).toBeGreaterThan(-1);

		});
	});

	describe("UnSelected Overlay", () => {
		it('should remove overaly id from the seleced overlays array\'s', () => {
			const fakeId = 'iu34-2322';
			const action = new SelectOverlayAction(fakeId);

			let result: IOverlayState = OverlayReducer(overlayInitialState, action);

			expect(result.selectedOverlays.indexOf(fakeId)).toBeGreaterThan(-1);

			const unSelectAction = new UnSelectOverlayAction(fakeId);

			result = OverlayReducer(result, unSelectAction);

			expect(result.selectedOverlays.length).toBe(0);
		});
	});

	describe("Load Overlays Success", () => {
		it('should load all overlays', () => {
			overlayInitialState.overlays = new Map();
			const o1 = {
				id: "12",
				name: "tmp12",
				date: new Date(2017, 7, 30),
				photoTime: new Date(2017, 7, 30).toISOString(),
				azimuth: 10
			};

			const o2 = {
				id: "13",
				name: "tmp13",
				date: new Date(2017, 6, 30),
				photoTime: new Date(2017, 6, 30).toISOString(),
				azimuth: 10
			};

			const overlays = [o1, o2] as any;

			const action = new LoadOverlaysSuccessAction(overlays);
			const result = OverlayReducer(overlayInitialState, action);

			expect(Array.from(result.overlays.keys())[0]).toBe('13');
			expect(result.overlays.size).toBe(2);
			expect(result.loading).toBe(false);
			expect(result.loaded).toBe(true);
		});
	});

	describe("Set Filters actions",() => {
		it("Set Filters actions",() => {
			//todo add test (check how filters are working)
		});
	});
});
