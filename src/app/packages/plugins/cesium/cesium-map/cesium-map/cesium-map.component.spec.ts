import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CesiumMapComponent } from './cesium-map.component';

describe('CesiumMapComponent', () => {
	let component: CesiumMapComponent;
	let fixture: ComponentFixture<CesiumMapComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CesiumMapComponent]
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
		expect(component.mapCreated.emit).toHaveBeenCalled();
	});
});
