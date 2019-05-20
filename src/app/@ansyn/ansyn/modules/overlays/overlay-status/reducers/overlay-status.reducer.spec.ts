import {
	SetFavoriteOverlaysAction, SetPresetOverlaysAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from '../actions/overlay-status.actions';
import { IOverlayStatusState, overlayStatusInitialState, OverlayStatusReducer } from './overlay-status.reducer';

describe('Overlay Status Reducer', () => {
	let o1, o2;
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
	});

	it('should add overlay to favoriteOverlays', () => {
		const action = new ToggleFavoriteAction({id: o1.id, value: true, overlay: o1})
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.favoriteOverlays.length).toBe(1);
	});

	it('should add array of overlays to favorite', () => {
		const favoriteOverlays = [o1, o2];
		const action = new SetFavoriteOverlaysAction(favoriteOverlays);
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.favoriteOverlays).toEqual(favoriteOverlays);
	});

	it('should add overlay to presetOverlay', () => {
		const action = new TogglePresetOverlayAction({id: o1.id, value: true, overlay: o1})
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.presetOverlays.length).toBe(1);
	});

	it('should add array of overlays to preset', () => {
		const presetOverlays = [o1, o2];
		const action = new SetPresetOverlaysAction(presetOverlays);
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.presetOverlays).toEqual(presetOverlays);
	});
});
