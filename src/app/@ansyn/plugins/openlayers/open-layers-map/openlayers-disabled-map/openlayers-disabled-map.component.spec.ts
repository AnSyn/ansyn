import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenLayersDisabledMapComponent } from './openlayers-disabled-map.component';
import { Observable } from 'rxjs/Observable';
import { cold } from 'jasmine-marbles';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { PLUGINS_COLLECTIONS } from '@ansyn/imagery/model/plugins-collection';

describe('openLayersMap OpenLayersDisabledMapComponent spec', () => {
	let component: OpenLayersDisabledMapComponent;
	let fixture: ComponentFixture<OpenLayersDisabledMapComponent>;
	let map: OpenLayersDisabledMap;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OpenLayersDisabledMapComponent],
			providers: [{ provide: PLUGINS_COLLECTIONS, useValue: [] }]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OpenLayersDisabledMapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		map = (<any>component).map; // protected
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
