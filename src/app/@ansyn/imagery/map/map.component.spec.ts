import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { Observable } from 'rxjs/index';
import { cold } from 'jasmine-marbles';
import { IMap } from '@ansyn/imagery/model/imap';
import { inject } from '@angular/core';

describe('MapComponent', () => {
	let component: MapComponent;
	let fixture: ComponentFixture<MapComponent>;
	let map: IMap;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MapComponent]
		})
			.compileComponents();
	}));

	beforeEach(inject([IMap], (_map: IMap<any>) => {
		fixture = TestBed.createComponent(MapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		map = _map;
	}));

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
		});

	});
});
