/**
 * Created by AsafMasa on 26/04/2017.
 */
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import {ImageryCommunicatorService} from '../api/imageryCommunicator.service';
import {ImageryComponentSettings} from './imageryComponentSettings';
import { MapSettings } from './mapSettings';
import { ImageryProviderService } from '../imageryProviderService/imageryProvider.service';

describe('ImageryComponent', () => {
	let component: ImageryComponent;
	let fixture: ComponentFixture<ImageryComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let imageryProviderService: ImageryProviderService;

	const geoPoint: GeoJSON.Point = {
		type: 'Point',
		coordinates: [15.7, 37.9]
	};

	const mapSettings: MapSettings = { mapType: 'openLayerMap', mapModes: []};

	const imageryData: ImageryComponentSettings = {mapComponentId: 'imagery1', mapSettings: [mapSettings], mapCenter: geoPoint};

	beforeEach(async(() => {
		TestBed.configureTestingModule({declarations: [ ImageryComponent ], providers: [ ImageryCommunicatorService, ImageryProviderService ]}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService, ImageryProviderService], (_imageryCommunicatorService, _imageryProviderService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
		imageryProviderService = _imageryProviderService;
		fixture = TestBed.createComponent(ImageryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {expect(component).toBeTruthy(); });

	// it('Create OpenLayersMap', () => {
	// 	component.mapComponentSettings = imageryData;
	// 	imageryProviderService.registerMapProvider()
	// 	component.ngOnInit();
	// 	const div = fixture.nativeElement.querySelector('#openLayersMap');
	// 	expect(div).toBeDefined();
	// 	const olOverlaycontainer = div.querySelector('.ol-overlaycontainer');
	// 	expect(olOverlaycontainer).toBeDefined();
	// });

	it('should create "imageryCommunicatorService" service', () => {
		expect(imageryCommunicatorService).toBeTruthy();
	});

	it('should create "imageryProviderService" service', () => {
		expect(imageryProviderService).toBeTruthy();
	});

	// it('Check setCenter and getCenter API', () => {
	// 	component.mapComponentSettings = imageryData;
	// 	component.ngOnInit();
	//
	// 	const geoPoint: GeoJSON.Point = {
	// 		type: 'Point',
	// 		coordinates: [15.7, 37.9]
	// 	};
	// 	imageryCommunicatorService.provideCommunicator(imageryData.mapComponentId).setCenter(geoPoint);
	// 	const expectedGeoPointCenter = imageryCommunicatorService.provideCommunicator(imageryData.mapComponentId).getCenter();
	// 	expect(geoPoint).toEqual(expectedGeoPointCenter);
	// });
});
