import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CesiumMapComponent } from './cesium-map.component';
import { PLUGINS_COLLECTIONS } from '@ansyn/imagery';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map';
import { CesiumMap } from '@ansyn/plugins/cesium/cesium-map';

describe('CesiumMapComponent', () => {
	let component: CesiumMapComponent;
	let fixture: ComponentFixture<CesiumMapComponent>;
	let map: CesiumMap;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CesiumMapComponent],
			providers: [{ provide: PLUGINS_COLLECTIONS, useValue: [] }]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CesiumMapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		map = (<any>component).map;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('createMap should raise map via success', () => {
		let success: boolean;

		beforeEach(() => {
			spyOn(map, 'initMap').and.callFake(() => Observable.of(success));
		});

		it('on success', () => {
			success = true;
			const expectedResult = cold('(b|)', { b: map });
			expect(component.createMap([])).toBeObservable(expectedResult);

		});

		it('on failed', () => {
			success = false;
			const expectedResult = cold('|');
			expect(component.createMap([])).toBeObservable(expectedResult);
		})

	});
});
