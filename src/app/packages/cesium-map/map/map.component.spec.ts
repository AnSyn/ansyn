/**
 * Created by AsafMas on 03/07/2017.
 */
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';

describe('cesiumMap Component spec', () => {
	let component: MapComponent;
	let fixture: ComponentFixture<MapComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MapComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('createMap should raise mapCreated event', () => {

		spyOn(component.mapCreated, 'emit');
		component.createMap([]);
		expect(component.mapCreated.emit).toHaveBeenCalled();
	});
});
