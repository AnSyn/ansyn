import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenLayersDisabledMapComponent } from './openlayers-disabled-map.component';
import TileLayer from 'ol/layer/tile';
import OSM from 'ol/source/osm';
import { PLUGINS_COLLECTIONS } from '@ansyn/imagery';

describe('openLayersMap OpenLayersDisabledMapComponent spec', () => {
	let component: OpenLayersDisabledMapComponent;
	let fixture: ComponentFixture<OpenLayersDisabledMapComponent>;

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
