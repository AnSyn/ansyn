/**
 * Created by AsafMasa on 26/04/2017.
 */
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import {ImageryCommunicatorService} from '../api/imageryCommunicatorService';
import {ImageryComponentSettings} from './imageryComponentSettings';

describe('ImageryComponent', () => {
	let component: ImageryComponent;
	let fixture: ComponentFixture<ImageryComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	const imageryData: ImageryComponentSettings = {mapComponentId: 'imagery1', mapTypes: ['openLayers']};

	beforeEach(async(() => {
		TestBed.configureTestingModule({declarations: [ ImageryComponent ], providers: [ ImageryCommunicatorService ]}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
		fixture = TestBed.createComponent(ImageryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {expect(component).toBeTruthy(); });

	it('Create OPenLayersMap', () => {
		component.mapComponentSettings = imageryData;
		component.ngOnInit();
		const div = fixture.nativeElement.querySelector('#openLayersMap');
		expect(div).toBeDefined();
		const olOverlaycontainer = div.querySelector('.ol-overlaycontainer');
		expect(olOverlaycontainer).toBeDefined();
	});

	it('should create "imageryCommunicatorService" service is fires event', () => {
		expect(imageryCommunicatorService).toBeTruthy();
	});

	// it('Check setCenter and getCenter API', () => {
	// 	component.mapComponentSettings = imageryData;
	// 	component.ngOnInit();
	//
	// 	const geoPoint: GeoJSON.Point = {
	// 		type: 'Point',
	// 		coordinates: [15.7, 37.9]
	// 	};
	// 	imageryCommunicatorService.getImageryCommunicator(imageryData.mapComponentId).setCenter(geoPoint);
	// 	const expectedGeoPointCenter = imageryCommunicatorService.getImageryCommunicator(imageryData.mapComponentId).getCenter();
	// 	expect(geoPoint).toEqual(expectedGeoPointCenter);
	// });
});
