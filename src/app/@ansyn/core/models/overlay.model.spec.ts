import { IOverlay, Overlay } from './overlay.model';

describe('Overlay', () => {

	it('should use default values when values are not passed on the constructor', () => {
		const overlay: IOverlay = new Overlay( <any> {

		});
		expect(overlay.projection).toEqual(Overlay.DEFAULT_PROJECTION);
		expect(overlay.sensorName).toEqual(Overlay.UNKNOWN_NAME);
		expect(overlay.sensorType).toEqual(Overlay.UNKNOWN_NAME);

	});

	it('should use default values when "undefined" values are passed on the constructor', () => {
		const overlay: IOverlay = new Overlay( <any> {
			projection: 'projection',
			sensorName: 'sensorName',
			sensorType: undefined
		});
		expect(overlay.projection).toEqual('projection');
		expect(overlay.sensorName).toEqual('sensorName');
		expect(overlay.sensorType).toEqual(Overlay.UNKNOWN_NAME);
	});

	it('should NOT use default values when values are passed on the constructor', () => {
		const overlay: IOverlay = new Overlay( <any> {
			projection: 'projection',
			sensorName: 'sensorName',
			sensorType: 'sensorType'
		});
		expect(overlay.projection).toEqual('projection');
		expect(overlay.sensorName).toEqual('sensorName');
		expect(overlay.sensorType).toEqual('sensorType');
	});

});
