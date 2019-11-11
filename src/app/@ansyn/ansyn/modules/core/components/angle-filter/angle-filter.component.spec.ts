import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { OverlayReducer, overlaysFeatureKey } from '../../../overlays/reducers/overlays.reducer';
import { AngleFilterComponent } from './angle-filter.component';
import { GeoRegisteration, IOverlay } from '../../../overlays/models/overlay.model';
import { Point } from 'geojson';
import { DisplayOverlayFromStoreAction } from '../../../overlays/actions/overlays.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery';

const POINT: Point = {
	coordinates: [-122.4093246459961, 37.59727478027344],
	type: 'Point'
};
const OVERLAYS: IOverlay[] = [
	{
		id: 'overlay3',
		name: 'overlay3',
		sensorLocation: { type: 'Point', coordinates: [-122.66360605712876, 37.625511951836515] },
		photoTime: '',
		date: new Date(),
		azimuth: 1.0,
		isGeoRegistered: GeoRegisteration.geoRegistered,
		tag: {
			degreeFromPoint: 444.3150991468975
		}
	},
	{
		id: 'overlay1',
		name: 'overlay1',
		sensorLocation: { type: 'Point', coordinates: [-122.34189022547085, 37.626320374229074] },
		photoTime: '',
		date: new Date(),
		azimuth: 1.0,
		isGeoRegistered: GeoRegisteration.geoRegistered,
		tag: {
			degreeFromPoint: 293.2050505878401
		}
	},
	{
		id: 'overlay2',
		name: 'overlay2',
		sensorLocation: { type: 'Point', coordinates: [-122.4194071924828, 37.60764502079111] },
		photoTime: '',
		date: new Date(),
		azimuth: 1.0,
		isGeoRegistered: GeoRegisteration.geoRegistered,
		tag: {
			degreeFromPoint: 404.0884066098252
		}
	}
];
const PAYLOAD = {
	click: {
		x: 0, y: 0
	},
	point: POINT,
	overlays: OVERLAYS,
	displayedOverlay: undefined
};
describe('AngleFilterComponent', () => {
	let component: AngleFilterComponent;
	let fixture: ComponentFixture<AngleFilterComponent>;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AngleFilterComponent],
			imports: [
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer })
			],
			providers: [
				ImageryCommunicatorService,
				provideMockActions(() => actions)
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const map = new Map();
		map.set('selectActiveMapId', '1');
		spyOn(store, 'select').and.callFake(type => of(map.get(type)));
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AngleFilterComponent);
		component = fixture.componentInstance;
		component.show([{ type: '', payload: PAYLOAD }, 0]);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set angles from overlay', () => {
		expect(component.overlaysAngles[0].overlay.name).toBe('overlay1');
		expect(component.overlaysAngles[1].overlay.name).toBe('overlay2');
		expect(component.overlaysAngles[2].overlay.name).toBe('overlay3');
	});

	it('next overlay should called DisplayOverlayAction', () => {
		spyOn(store, 'dispatch');
		component.mapId = 'mapId';
		component.overlay = OVERLAYS[1];
		component.nextOverlay(new MouseEvent('click'), true);
		expect(store.dispatch).toHaveBeenCalledWith(new DisplayOverlayFromStoreAction({ id: OVERLAYS[2].id }))
	})

});
