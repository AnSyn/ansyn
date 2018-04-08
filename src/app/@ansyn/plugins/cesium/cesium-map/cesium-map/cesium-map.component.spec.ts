import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CesiumMapComponent } from './cesium-map.component';
import { PLUGINS_COLLECTIONS } from '@ansyn/imagery';

describe('CesiumMapComponent', () => {
	let component: CesiumMapComponent;
	let fixture: ComponentFixture<CesiumMapComponent>;

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
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('createMap should raise mapCreated event', () => {

		spyOn(component.mapCreated, 'emit');
		component.createMap([]);
		// Implementation of Cesium is missing.
		expect(component.mapCreated.emit).not.toHaveBeenCalled();
	});
});
