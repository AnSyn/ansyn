import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { AnaglyphSensorAlertComponent } from './anaglyph-sensor-alert.component';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AnaglyphSensorService } from '../service/anaglyph-sensor.service';
import { AnaglyphConfig } from '../models/anaglyph.model';

describe('AnaglyphSensorAlertComponent', () => {
	let component: AnaglyphSensorAlertComponent;
	let fixture: ComponentFixture<AnaglyphSensorAlertComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				ImageryCommunicatorService,
				AnaglyphSensorService,
				{
					provide: AnaglyphConfig,
					useValue: {}
				}],
			declarations: [AnaglyphSensorAlertComponent],
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer }), TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService, Store], (_imageryCommunicatorService: ImageryCommunicatorService, _store: Store<any>) => {
		fixture = TestBed.createComponent(AnaglyphSensorAlertComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		imageryCommunicatorService = _imageryCommunicatorService;
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
