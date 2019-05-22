import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { LoadOverlaysSuccessAction, UpdateLoadedOverlays } from '../../actions/overlays.actions';
import { OverlayReducer, overlaysFeatureKey } from '../../reducers/overlays.reducer';
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
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer }),
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
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaySourceTypeNoticeComponent);
		component = fixture.componentInstance;

		store.dispatch(new LoadOverlaysSuccessAction(<any>overlays, true))
		fixture.detectChanges();
	});


	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should not find the title for the overlay', () => {
		component.mapId = 'mapId1';
		store.dispatch(new UpdateLoadedOverlays({ mapId: component.mapId, overlayId: 'overlay1' }));
		fixture.detectChanges();
		expect(component.title).toBeFalsy();
	});

	it('should find the title for the overlay, default value for source type', () => {
		component.mapId = 'mapId2';
		store.dispatch(new UpdateLoadedOverlays({ mapId: component.mapId, overlayId: 'overlay2' }));
		fixture.detectChanges();
		expect(component.title).toEqual('DDD');
	});

	it('should find the title for the overlay, value for sensor type', () => {
		component.mapId = 'mapId3';
		store.dispatch(new UpdateLoadedOverlays({ mapId: component.mapId, overlayId: 'overlay3' }));
		fixture.detectChanges();
		expect(component.title).toEqual('blublublu');
	});

	it('should find the title for the overlay, value for sensor type, plus year', () => {
		component.mapId = 'mapId4';
		store.dispatch(new UpdateLoadedOverlays({ mapId: component.mapId, overlayId: 'overlay4' }));
		fixture.detectChanges();
		expect(component.title).toEqual('My year is 1969');
	});
});
