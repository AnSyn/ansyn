/**
 * Created by AsafMas on 03/07/2017.
 */
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import * as ol from 'openlayers';

describe('openLayersMap Component spec', () => {
	let component: MapComponent;
	let fixture: ComponentFixture<MapComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ MapComponent ]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {expect(component).toBeTruthy(); });

	it('createMap should raise mapCreated event', () => {

		const osmLayer = new ol.layer.Tile({
			source: new ol.source.OSM()
		});

		spyOn(component.mapCreated, 'emit');
		component.createMap([osmLayer]);
		expect(component.mapCreated.emit).toHaveBeenCalled();
	});
});
