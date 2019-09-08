import { Store, StoreModule } from '@ngrx/store';
import { inject, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { AnaglyphSensorPlugin } from './anaglyph-sensor.plugin';
import { AnaglyphSensorService } from '../service/anaglyph-sensor.service';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { AnaglyphConfig } from '../models/anaglyph.model';

describe('AnaglyphSensorPlugin', () => {
	let anaglyphSensorPlugin: AnaglyphSensorPlugin;
	let store: Store<any>;
	let actions: Observable<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideMockActions(() => actions),
				AnaglyphSensorPlugin,
				AnaglyphSensorService,
				ImageryCommunicatorService,
				{
					provide: AnaglyphConfig,
					useValue: {}
				}
			],
			imports: [StoreModule.forRoot({})]
		});
	});

	beforeEach(inject([Store, AnaglyphSensorPlugin], (_store: Store<any>, _anaglyphSensorPlugin1: AnaglyphSensorPlugin) => {
		store = _store;
		anaglyphSensorPlugin = _anaglyphSensorPlugin1;
	}));

	it('should be defined', () => {
		expect(anaglyphSensorPlugin).toBeDefined();
	});
});
