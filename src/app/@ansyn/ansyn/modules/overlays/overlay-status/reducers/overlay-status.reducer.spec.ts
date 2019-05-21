import { GeoRegisteration, IOverlay } from '../../models/overlay.model';
import {
	SetFavoriteOverlaysAction, SetPresetOverlaysAction,
	ToggleFavoriteAction, SetRemovedOverlaysIdAction,
	SetRemovedOverlaysVisibilityAction,
	TogglePresetOverlayAction
} from '../actions/overlay-status.actions';
import { IOverlayStatusState, overlayStatusInitialState, OverlayStatusReducer } from './overlay-status.reducer';


const o1: IOverlay = {
	id: '12',
	name: 'tmp12',
	date: new Date(2017, 7, 30),
	photoTime: new Date(2017, 7, 30).toISOString(),
	azimuth: 10,
	isGeoRegistered: GeoRegisteration.geoRegistered

};
const o2: IOverlay = {
	id: '13',
	name: 'tmp13',
	date: new Date(2017, 6, 30),
	photoTime: new Date(2017, 6, 30).toISOString(),
	azimuth: 10,
	isGeoRegistered: GeoRegisteration.notGeoRegistered
};
describe('Overlay Status Reducer', () => {


	it('should add overlay to favoriteOverlays', () => {
		const action = new ToggleFavoriteAction({ id: o1.id, value: true, overlay: o1 })
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.favoriteOverlays.length).toBe(1);
	});

	it('should add array of overlays to favorite', () => {
		const favoriteOverlays = [o1, o2];
		const action = new SetFavoriteOverlaysAction(favoriteOverlays);
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.favoriteOverlays).toEqual(favoriteOverlays);
	});

	it('should add overlay id to removeOverlayId', () => {
		const action = new SetRemovedOverlaysIdAction({ mapId: 'mapId', id: 'overlayId', value: true });
		const result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.removedOverlaysIds.length).toBe(1);
		expect(result.removedOverlaysVisibility).toEqual(true);
		const action2 = new SetRemovedOverlaysVisibilityAction(false);
		const result2: IOverlayStatusState = OverlayStatusReducer(result, action2);
		expect(result2.removedOverlaysVisibility).toEqual(false);
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
