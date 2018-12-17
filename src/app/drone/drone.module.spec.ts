import { DroneModule } from './drone.module';

describe('DroneModule', () => {
	let droneModule: DroneModule;

	beforeEach(() => {
		droneModule = new DroneModule();
	});

	it('should create an instance', () => {
		expect(droneModule).toBeTruthy();
	});
});
