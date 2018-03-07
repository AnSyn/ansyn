import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DisabledMapComponent } from './disabled-map.component';
import TileLayer from 'ol/layer/tile';
import OSM from 'ol/source/osm';

describe('openLayersMap DisabledMapComponent spec', () => {
	let component: DisabledMapComponent;
	let fixture: ComponentFixture<DisabledMapComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DisabledMapComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DisabledMapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('createMap should raise mapCreated event', () => {

		const osmLayer = new TileLayer({
			source: new OSM()
		});

		spyOn(component.mapCreated, 'emit');
		component.createMap([osmLayer]);
		expect(component.mapCreated.emit).toHaveBeenCalled();
	});
});
