import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenlayersMapComponent } from './openlayers-map.component';
import TileLayer from 'ol/layer/tile';
import OSM from 'ol/source/osm';
import * as openLayersMap from './openlayers-map';

describe('OpenlayersMapComponent', () => {
	let component: OpenlayersMapComponent;
	let fixture: ComponentFixture<OpenlayersMapComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OpenlayersMapComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OpenlayersMapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('createMap should raise mapCreated event', () => {
		spyOn(openLayersMap, 'OpenLayersMap');
		spyOn(component.mapCreated, 'emit');
		const position = { projectedState: { projection: { code: 'projectionCode' } } };
		const osmLayer = new TileLayer({ source: new OSM() });
		component.createMap([osmLayer], <any> position);
		expect(component.mapCreated.emit).toHaveBeenCalled();
	});
});
