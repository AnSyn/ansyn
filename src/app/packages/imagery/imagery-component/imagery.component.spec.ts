/**
 * Created by AsafMasa on 26/04/2017.
 */
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { ImageryComponentSettings } from '../model/imagery-component-settings';
import { ImageryProviderService } from '../provider-service/provider.service';
import { BaseSourceProvider, MapSourceProviderContainerService } from '@ansyn/map-source-provider';

import { configuration } from '../../../../configuration/configuration';
import { ConfigurationToken } from '../configuration.token';

class SourceProviderMock1 implements BaseSourceProvider {
	mapType= 'mapType1';
	sourceType = 'sourceType1';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}
}

describe('ImageryComponent', () => {
	let component: ImageryComponent;
	let fixture: ComponentFixture<ImageryComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let imageryProviderService: ImageryProviderService;

	const geoPoint: GeoJSON.Point = {
		type: 'Point',
		coordinates: [15.7, 37.9]
	};

	const imageryData: ImageryComponentSettings = {id: 'imagery1', mapType: 'openLayersMap', data:{position: {center: geoPoint, zoom: 0}}};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ImageryComponent ],
			providers: [
				MapSourceProviderContainerService,
				{ provide: ConfigurationToken, useValue: configuration.ImageryConfig },
				{ provide: BaseSourceProvider , useClass: SourceProviderMock1, multi:true},
				ImageryCommunicatorService, ImageryProviderService ]}).compileComponents();
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
