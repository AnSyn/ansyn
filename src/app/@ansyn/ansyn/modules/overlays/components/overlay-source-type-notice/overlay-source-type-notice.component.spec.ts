import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { mapFeatureKey, MapReducer, selectMaps, UpdateMapAction } from '@ansyn/map-facade';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { OverlaysConfig } from '../../services/overlays.service';
import { OverlaySourceTypeNoticeComponent } from './overlay-source-type-notice.component';


const overlays = [
	{ id: 'overlay1', sourceType: 'SRC_TYPE_5' },
	{ id: 'overlay2', sourceType: 'SRC_TYPE_1' },
	{ id: 'overlay3', sourceType: 'SRC_TYPE_1', sensorType: 'SENSOR_TYPE_1' },
	{
		id: 'overlay4',
		sourceType: 'SRC_TYPE_1',
		sensorType: 'SENSOR_TYPE_2',
		date: new Date('July 20, 69 00:20:18')
	}
];
describe('OverlaySourceTypeNoticeComponent', () => {
	let component: OverlaySourceTypeNoticeComponent;
	let fixture: ComponentFixture<OverlaySourceTypeNoticeComponent>;
	let store: Store<any>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
				EffectsModule.forRoot([])
			],
			declarations: [OverlaySourceTypeNoticeComponent],
			providers: [
				{
					provide: OverlaysConfig, useValue: {
						sourceTypeNotices: {
							'SRC_TYPE_1': {
								Default: 'DDD',
								'SENSOR_TYPE_1': 'blublublu',
								'SENSOR_TYPE_2': 'My year is $year'
							}
						}
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		spyOn(store, 'select').and.callFake((type) => of());
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaySourceTypeNoticeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});


	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should not find the title for the overlay', () => {
		component.overlay = <any>overlays[0];
		fixture.detectChanges();
		expect(component.title).toBeFalsy();
	});

	it('should find the title for the overlay, default value for source type', () => {
		component.overlay = <any>overlays[1];
		fixture.detectChanges();
		expect(component.title).toEqual('DDD');
	});

	it('should find the title for the overlay, value for sensor type', () => {
		component.overlay = <any>overlays[2];
		fixture.detectChanges();
		expect(component.title).toEqual('blublublu');
	});

	it('should find the title for the overlay, value for sensor type, plus year', () => {
		component.overlay = <any>overlays[3]
		fixture.detectChanges();
		expect(component.title).toEqual('My year is 1969');
	});
});
