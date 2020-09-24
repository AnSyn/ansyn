import { GeoRegisteration, IOverlay } from '../../models/overlay.model';
import {
	SetFavoriteOverlaysAction,
	ToggleFavoriteAction,
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
		const action = new ToggleFavoriteAction({ id: o1.id, value: true, overlay: o1 });
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.favoriteOverlays.length).toBe(1);
	});

	it('should add array of overlays to favorite', () => {
		const favoriteOverlays = [o1, o2];
		const action = new SetFavoriteOverlaysAction(favoriteOverlays);
		let result: IOverlayStatusState = OverlayStatusReducer(overlayStatusInitialState, action);
		expect(result.favoriteOverlays).toEqual(favoriteOverlays);
	});

});
